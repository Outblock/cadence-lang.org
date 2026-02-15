import{j as e}from"./main-BXy83AsK.js";let a=`

Attachments are a feature of Cadence designed to allow developers to extend a struct or resource type (even one that they did not create) with new functionality, without requiring the original author of the type to plan or account for the intended behavior.

Declaring attachments [#declaring-attachments]

Attachments are declared with the \`attachment\` keyword, which is declared by using a new form of the composite declaration: \`attachment <Name> for <Type>: <Conformances> { ... }\`, where the attachment functions and fields are declared in the body.

As such, the following are examples of legal declarations of attachments:

\`\`\`cadence
access(all)
attachment Foo for MyStruct {
    // ...
}

attachment Bar for MyResource: MyResourceInterface {
    // ...
}

attachment Baz for MyInterface: MyOtherInterface {
    // ...
}
\`\`\`

Like all other type declarations, attachments can only be declared with \`all\` access.

Specifying the kind (struct or resource) of an attachment is not necessary, as its kind will necessarily be the same as the type it is extending. Note that the base type may be either a concrete composite type or an interface. In the former case, the attachment is only usable on values specifically of that base type, while in the case of an interface, the attachment is usable on any type that conforms to that interface.

The body of the attachment follows the same declaration rules as composites. In particular, they may have both field and function members, and any field members must be initialized in an initializer. Only resource-kind attachments may have resource members.

The \`self\` keyword is available in attachment bodies, but unlike in a composite, \`self\` is a **reference** type, rather than a composite type: in an attachment declaration for \`A\`, the type of \`self\` would be a reference to \`A\`, rather than \`A\` as in other composite declarations. The specific entitlements that this reference has depend on the access modifier associated with the member function in which the \`self\`-reference appears, and are explained in more detail below.

If a resource with attachments on it is \`destroy\`ed, all of its attachments are \`destroy\`ed in an unspecified order. The only guarantee about the order in which attachments are destroyed in this case is that the base resource will be the last thing destroyed.

Within the body of an attachment, there is also a \`base\` keyword available, which contains a reference to the attachment's base value; that is, the composite to which the attachment is attached. Its type, therefore, is a reference to the attachment's declared base type. So, for an attachment declared as \`access(all) attachment Foo for Bar\`, the \`base\` field of \`Foo\` would have type \`&Bar\`.

For example, this is a valid declaration of an attachment:

\`\`\`
access(all)
resource R {

    access(all)
    let x: Int

    init (_ x: Int) {
        self.x = x
    }

    access(all)
    fun foo() { ... }
}

access(all)
attachment A for R {
    
    access(all)
    let derivedX: Int

    init (_ scalar: Int) {
        self.derivedX = base.x * scalar
    }

    access(all)
    fun foo() {
        base.foo()
    }
}
\`\`\`

For the purposes of external mutation checks or [access control], the attachment is considered a separate declaration from its base type. A developer cannot, therefore, access any \`access(self)\` fields (or \`access(contract)\` fields if the base was defined in a different contract to the attachment) on the \`base\` value, nor can they mutate any array or dictionary typed fields.

\`\`\`cadence
access(all)
resource interface SomeInterface {

    access(all)
    let b: Bool

    access(self)
    let i: Int

    access(all)
    let a: [String]
}
access(all)
attachment SomeAttachment for SomeContract.SomeStruct {

    access(all)
    let i: Int

    init(i: Int) {
        if base.b {
            self.i = base.i // cannot access \`i\` on the \`base\` value
        } else {
            self.i = i
        }
    }

    access(all)
    fun foo() {
        base.a.append("hello") // cannot mutate \`a\` outside of the composite where it was defined
    }
}
\`\`\`

Within an attachment's member function, the \`base\` and \`self\` references are entitled to the same entitlements that the function's access modifier specifies. For example, in an attachment declared as \`access(all) attachment A for R\`, within a definition of a function \`access(E) fun foo()\`, the type of \`base\` would be \`auth(E) &R\`, and the type of \`self\` would be \`auth(E) &A\`.

Thus, the following definition works:

\`\`\`cadence
resource R {
    access(E)
    fun foo() {
        //...
    }
}

access(all)
attachment A for R {
    access(E)
    fun bar() {
        base.foo() // available because \`E\` is required above, and thus \`base\` is type \`auth(E) &R\`.
    }
}
\`\`\`

While this does **not** work:

\`\`\`cadence
// Bad code example.  Do not use.
resource R {
    access(E)
    fun foo() {
        //...
    }
}

access(all)
attachment A for R {

    access(self)
    fun bar() {
        base.foo() // unavailable because this function has \`self\` access, and thus \`base\` only is type \`&R\`.
    }

}
\`\`\`

Note that as a result of how entitlements are propagated to the \`self\` and \`base\` values here, attachment definitions can only support the same entitlements that their base values support; i.e., some attachment \`A\` defined for \`R\` can only use an entitlement \`E\` in its definition if \`R\` also uses \`E\` in its definition (or the definition of any interfaces to which it conforms).

Attachment types [#attachment-types]

An attachment declared with \`access(all) attachment A for C { ... }\` will have a nominal type \`A\`.

It is important to note that attachments are not first-class values, and as such, their usage is limited in certain ways. In particular, their types cannot appear outside of a reference type. So, for example, given an  attachment declaration \`attachment A for X {}\`, the types \`A\`, \`A?\`, \`[A]\`, and \`fun(): A\` are not valid type annotations, while \`&A\`, \`&A?\`, \`[&A]\`, and \`fun(): &A\` are valid.

Creating attachments [#creating-attachments]

An attachment is created using an \`attach\` expression, where the attachment is both initialized and attached to the base value in a single operation. Attachments are not first-class values; they cannot exist independently of a base value, nor can they be moved around on their own. This means that an \`attach\` expression is the only place in which an attachment constructor can be called. Tightly coupling the creation and the attaching of attachment values helps to make reasoning about attachments simpler for the user. Also for this reason, resource attachments do not need an explicit \`<-\` move operator when they appear in an \`attach\` expression.

An attach expression consists of the \`attach\` keyword, a constructor call for the attachment value, the \`to\` keyword, and an expression that evaluates to the base value for that attachment. Any arguments required by the attachment's initializer are provided in its constructor call:

\`\`\`cadence
access(all)
resource R {}

access(all)
attachment A for R {
    init(x: Int) {
        //...
    }
}

// ...
let r <- create R()
let r2 <- attach A(x: 3) to <-r
\`\`\`

The expression on the right-hand side of the \`to\` keyword must evaluate to a composite value whose type is a subtype of the attachment's base, and is evaluated before the call to the constructor on the left side of \`to\`. This means that the \`base\` value is available inside of the attachment's initializer, but it is important to note that the attachment being created will not be accessible on the \`base\` (see [accessing attachments] below) until after the constructor finishes executing:

\`\`\`cadence
access(all)
resource interface I {}

access(all)
resource R: I {}

access(all)
attachment A for I {}

// ...
let r <- create R() // has type @R
let r2 <- attach A() to <-r // ok, because \`R\` is a subtype of \`I\`, still has type @R
\`\`\`

Because attachments are stored on their bases by type, there can only be one attachment of each type present on a value at a time. Cadence will raise a runtime error if a user attempts to add an attachment to a value when one already exists on that value. The type returned by the \`attach\` expression is the same type as the expression on the right-hand side of the \`to\`; attaching an attachment to a value does not change its type.

Accessing attachments [#accessing-attachments]

Attachments are accessed on composites via type-indexing: composite values function like a dictionary where the keys are types and the values are attachments. So, given a composite value \`v\`, one can look up the attachment named \`A\` on \`v\` using an indexing syntax:

\`\`\`cadence
let a = v[A] // has type \`&A?\`
\`\`\`

This syntax requires that \`A\` is a nominal attachment type, and that \`v\` has a composite type that is a subtype of \`A\`'s declared base type. As mentioned above, attachments are not first-class values, so this indexing returns a reference to the attachment on \`v\`, rather than the attachment itself. If the attachment with the given type does not exist on \`v\`, this expression returns \`nil\`.

The set of entitlements to which the result of an attachment access is authorized is the same as the set of entitlements to which the base value is authorized. So, for example, given the following definition for \`A\`:

\`\`\`cadence
entitlement E 
entitlement F 

resource R {
    access(E)
    fun foo() {
        // ... 
    }

    access(F)
    fun bar() { 
        // ... 
    }
}

attachment A for R {
    access(E | F)
    fun qux() { 
        // ... 
    }
}

// ... 

let a = v[A]!
\`\`\`

When \`v\` has type \`&R\`, the resulting type of \`a\` will be an unauthorized \`&A\`. Contrarily, if \`v\` has type \`auth(E) &R\`, then the type of \`a\` will be authorized to the same: \`auth(E) &A\`. Finally, when \`v\` is not a reference (i.e., an owned value of type \`R\`), then \`a\` will be "fully entitled" to \`A\`; it will be granted all the entitlements mentioned by \`A\`, i.e., in this case, it will have type \`auth(E, F) &A\`.

This is roughly equivalent to the behavior of the \`Identity\` [entitlement mapping]; indeed, attachments can be thought of as being \`Identity\`-mapped fields on their base value.

Removing attachments [#removing-attachments]

Attachments can be removed from a value with a \`remove\` statement. The statement consists of the \`remove\` keyword, the nominal type for the attachment to be removed, the \`from\` keyword, and the value from which the attachment is meant to be removed.

The value on the right-hand side of \`from\` must be a composite value whose type is a subtype of the attachment type's declared base.

For example, to remove an \`A\` attachment from some resource \`r\` whose type supports that attachment:

\`\`\`cadence
remove A from r
\`\`\`

After the statement executes, the composite value on the right-hand side of \`from\` will no longer contain the attachment. If the value does not contain the attachment that appears after the \`remove\` keyword, this statement has no effect.

Attachments can be removed from a type in any order, so developers should take care not to design any attachments that rely on specific behaviors of other attachments, as there is no requirement that an attachment depend on another or that a type has a given attachment when another attachment is present.

If a resource containing attachments is \`destroy\`ed, all of its attachments will be \`destroy\`ed in an arbitrary order.

Attachment iteration [#attachment-iteration]

Attachments can be iterated over using the \`forEachAttachment\` function, a built-in function provided on types which support attachments. The signature is as follows:

\`\`\`cadence
// for a struct
fun forEachAttachment(fun(&AnyStructAttachment)){}
// for a resource
fun forEachAttachment(fun(&AnyResourceAttachment)){} 
\`\`\`

The function takes a single argument, a callback function that accepts a reference to an attachment of the appropriate type. The callback function is called for each attachment present on the value, in an unspecified order.

For example, to iterate over all attachments on a resource \`r\`:

\`\`\`cadence
r.forEachAttachment(fun(attachmentRef: &AnyResourceAttachment) {
    // Do something with each attachment
})
\`\`\`

{/* Relative links. Will not render on the page */}

[access control]: ./access-control

[entitlement mapping]: ./access-control#entitlement-mappings

[accessing attachments]: #accessing-attachments
`,h={title:"Attachments"},l={contents:[{heading:void 0,content:"Attachments are a feature of Cadence designed to allow developers to extend a struct or resource type (even one that they did not create) with new functionality, without requiring the original author of the type to plan or account for the intended behavior."},{heading:"declaring-attachments",content:"Attachments are declared with the `attachment` keyword, which is declared by using a new form of the composite declaration: `attachment <Name> for <Type>: <Conformances> { ... }`, where the attachment functions and fields are declared in the body."},{heading:"declaring-attachments",content:"As such, the following are examples of legal declarations of attachments:"},{heading:"declaring-attachments",content:"Like all other type declarations, attachments can only be declared with `all` access."},{heading:"declaring-attachments",content:"Specifying the kind (struct or resource) of an attachment is not necessary, as its kind will necessarily be the same as the type it is extending. Note that the base type may be either a concrete composite type or an interface. In the former case, the attachment is only usable on values specifically of that base type, while in the case of an interface, the attachment is usable on any type that conforms to that interface."},{heading:"declaring-attachments",content:"The body of the attachment follows the same declaration rules as composites. In particular, they may have both field and function members, and any field members must be initialized in an initializer. Only resource-kind attachments may have resource members."},{heading:"declaring-attachments",content:"The `self` keyword is available in attachment bodies, but unlike in a composite, `self` is a **reference** type, rather than a composite type: in an attachment declaration for `A`, the type of `self` would be a reference to `A`, rather than `A` as in other composite declarations. The specific entitlements that this reference has depend on the access modifier associated with the member function in which the `self`-reference appears, and are explained in more detail below."},{heading:"declaring-attachments",content:"If a resource with attachments on it is `destroy`ed, all of its attachments are `destroy`ed in an unspecified order. The only guarantee about the order in which attachments are destroyed in this case is that the base resource will be the last thing destroyed."},{heading:"declaring-attachments",content:"Within the body of an attachment, there is also a `base` keyword available, which contains a reference to the attachment's base value; that is, the composite to which the attachment is attached. Its type, therefore, is a reference to the attachment's declared base type. So, for an attachment declared as `access(all) attachment Foo for Bar`, the `base` field of `Foo` would have type `&Bar`."},{heading:"declaring-attachments",content:"For example, this is a valid declaration of an attachment:"},{heading:"declaring-attachments",content:"For the purposes of external mutation checks or [access control], the attachment is considered a separate declaration from its base type. A developer cannot, therefore, access any `access(self)` fields (or `access(contract)` fields if the base was defined in a different contract to the attachment) on the `base` value, nor can they mutate any array or dictionary typed fields."},{heading:"declaring-attachments",content:"Within an attachment's member function, the `base` and `self` references are entitled to the same entitlements that the function's access modifier specifies. For example, in an attachment declared as `access(all) attachment A for R`, within a definition of a function `access(E) fun foo()`, the type of `base` would be `auth(E) &R`, and the type of `self` would be `auth(E) &A`."},{heading:"declaring-attachments",content:"Thus, the following definition works:"},{heading:"declaring-attachments",content:"While this does **not** work:"},{heading:"declaring-attachments",content:"Note that as a result of how entitlements are propagated to the `self` and `base` values here, attachment definitions can only support the same entitlements that their base values support; i.e., some attachment `A` defined for `R` can only use an entitlement `E` in its definition if `R` also uses `E` in its definition (or the definition of any interfaces to which it conforms)."},{heading:"attachment-types",content:"An attachment declared with `access(all) attachment A for C { ... }` will have a nominal type `A`."},{heading:"attachment-types",content:"It is important to note that attachments are not first-class values, and as such, their usage is limited in certain ways. In particular, their types cannot appear outside of a reference type. So, for example, given an  attachment declaration `attachment A for X {}`, the types `A`, `A?`, `[A]`, and `fun(): A` are not valid type annotations, while `&A`, `&A?`, `[&A]`, and `fun(): &A` are valid."},{heading:"creating-attachments",content:"An attachment is created using an `attach` expression, where the attachment is both initialized and attached to the base value in a single operation. Attachments are not first-class values; they cannot exist independently of a base value, nor can they be moved around on their own. This means that an `attach` expression is the only place in which an attachment constructor can be called. Tightly coupling the creation and the attaching of attachment values helps to make reasoning about attachments simpler for the user. Also for this reason, resource attachments do not need an explicit `<-` move operator when they appear in an `attach` expression."},{heading:"creating-attachments",content:"An attach expression consists of the `attach` keyword, a constructor call for the attachment value, the `to` keyword, and an expression that evaluates to the base value for that attachment. Any arguments required by the attachment's initializer are provided in its constructor call:"},{heading:"creating-attachments",content:"The expression on the right-hand side of the `to` keyword must evaluate to a composite value whose type is a subtype of the attachment's base, and is evaluated before the call to the constructor on the left side of `to`. This means that the `base` value is available inside of the attachment's initializer, but it is important to note that the attachment being created will not be accessible on the `base` (see [accessing attachments] below) until after the constructor finishes executing:"},{heading:"creating-attachments",content:"Because attachments are stored on their bases by type, there can only be one attachment of each type present on a value at a time. Cadence will raise a runtime error if a user attempts to add an attachment to a value when one already exists on that value. The type returned by the `attach` expression is the same type as the expression on the right-hand side of the `to`; attaching an attachment to a value does not change its type."},{heading:"accessing-attachments",content:"Attachments are accessed on composites via type-indexing: composite values function like a dictionary where the keys are types and the values are attachments. So, given a composite value `v`, one can look up the attachment named `A` on `v` using an indexing syntax:"},{heading:"accessing-attachments",content:"This syntax requires that `A` is a nominal attachment type, and that `v` has a composite type that is a subtype of `A`'s declared base type. As mentioned above, attachments are not first-class values, so this indexing returns a reference to the attachment on `v`, rather than the attachment itself. If the attachment with the given type does not exist on `v`, this expression returns `nil`."},{heading:"accessing-attachments",content:"The set of entitlements to which the result of an attachment access is authorized is the same as the set of entitlements to which the base value is authorized. So, for example, given the following definition for `A`:"},{heading:"accessing-attachments",content:'When `v` has type `&R`, the resulting type of `a` will be an unauthorized `&A`. Contrarily, if `v` has type `auth(E) &R`, then the type of `a` will be authorized to the same: `auth(E) &A`. Finally, when `v` is not a reference (i.e., an owned value of type `R`), then `a` will be "fully entitled" to `A`; it will be granted all the entitlements mentioned by `A`, i.e., in this case, it will have type `auth(E, F) &A`.'},{heading:"accessing-attachments",content:"This is roughly equivalent to the behavior of the `Identity` [entitlement mapping]; indeed, attachments can be thought of as being `Identity`-mapped fields on their base value."},{heading:"removing-attachments",content:"Attachments can be removed from a value with a `remove` statement. The statement consists of the `remove` keyword, the nominal type for the attachment to be removed, the `from` keyword, and the value from which the attachment is meant to be removed."},{heading:"removing-attachments",content:"The value on the right-hand side of `from` must be a composite value whose type is a subtype of the attachment type's declared base."},{heading:"removing-attachments",content:"For example, to remove an `A` attachment from some resource `r` whose type supports that attachment:"},{heading:"removing-attachments",content:"After the statement executes, the composite value on the right-hand side of `from` will no longer contain the attachment. If the value does not contain the attachment that appears after the `remove` keyword, this statement has no effect."},{heading:"removing-attachments",content:"Attachments can be removed from a type in any order, so developers should take care not to design any attachments that rely on specific behaviors of other attachments, as there is no requirement that an attachment depend on another or that a type has a given attachment when another attachment is present."},{heading:"removing-attachments",content:"If a resource containing attachments is `destroy`ed, all of its attachments will be `destroy`ed in an arbitrary order."},{heading:"attachment-iteration",content:"Attachments can be iterated over using the `forEachAttachment` function, a built-in function provided on types which support attachments. The signature is as follows:"},{heading:"attachment-iteration",content:"The function takes a single argument, a callback function that accepts a reference to an attachment of the appropriate type. The callback function is called for each attachment present on the value, in an unspecified order."},{heading:"attachment-iteration",content:"For example, to iterate over all attachments on a resource `r`:"}],headings:[{id:"declaring-attachments",content:"Declaring attachments"},{id:"attachment-types",content:"Attachment types"},{id:"creating-attachments",content:"Creating attachments"},{id:"accessing-attachments",content:"Accessing attachments"},{id:"removing-attachments",content:"Removing attachments"},{id:"attachment-iteration",content:"Attachment iteration"}]};const c=[{depth:2,url:"#declaring-attachments",title:e.jsx(e.Fragment,{children:"Declaring attachments"})},{depth:3,url:"#attachment-types",title:e.jsx(e.Fragment,{children:"Attachment types"})},{depth:2,url:"#creating-attachments",title:e.jsx(e.Fragment,{children:"Creating attachments"})},{depth:2,url:"#accessing-attachments",title:e.jsx(e.Fragment,{children:"Accessing attachments"})},{depth:2,url:"#removing-attachments",title:e.jsx(e.Fragment,{children:"Removing attachments"})},{depth:2,url:"#attachment-iteration",title:e.jsx(e.Fragment,{children:"Attachment iteration"})}];function t(i){const s={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",strong:"strong",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.p,{children:"Attachments are a feature of Cadence designed to allow developers to extend a struct or resource type (even one that they did not create) with new functionality, without requiring the original author of the type to plan or account for the intended behavior."}),`
`,e.jsx(s.h2,{id:"declaring-attachments",children:"Declaring attachments"}),`
`,e.jsxs(s.p,{children:["Attachments are declared with the ",e.jsx(s.code,{children:"attachment"})," keyword, which is declared by using a new form of the composite declaration: ",e.jsx(s.code,{children:"attachment <Name> for <Type>: <Conformances> { ... }"}),", where the attachment functions and fields are declared in the body."]}),`
`,e.jsx(s.p,{children:"As such, the following are examples of legal declarations of attachments:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyStruct"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Bar"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyResourceInterface"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Baz"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyInterface"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyOtherInterface"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["Like all other type declarations, attachments can only be declared with ",e.jsx(s.code,{children:"all"})," access."]}),`
`,e.jsx(s.p,{children:"Specifying the kind (struct or resource) of an attachment is not necessary, as its kind will necessarily be the same as the type it is extending. Note that the base type may be either a concrete composite type or an interface. In the former case, the attachment is only usable on values specifically of that base type, while in the case of an interface, the attachment is usable on any type that conforms to that interface."}),`
`,e.jsx(s.p,{children:"The body of the attachment follows the same declaration rules as composites. In particular, they may have both field and function members, and any field members must be initialized in an initializer. Only resource-kind attachments may have resource members."}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"self"})," keyword is available in attachment bodies, but unlike in a composite, ",e.jsx(s.code,{children:"self"})," is a ",e.jsx(s.strong,{children:"reference"})," type, rather than a composite type: in an attachment declaration for ",e.jsx(s.code,{children:"A"}),", the type of ",e.jsx(s.code,{children:"self"})," would be a reference to ",e.jsx(s.code,{children:"A"}),", rather than ",e.jsx(s.code,{children:"A"})," as in other composite declarations. The specific entitlements that this reference has depend on the access modifier associated with the member function in which the ",e.jsx(s.code,{children:"self"}),"-reference appears, and are explained in more detail below."]}),`
`,e.jsxs(s.p,{children:["If a resource with attachments on it is ",e.jsx(s.code,{children:"destroy"}),"ed, all of its attachments are ",e.jsx(s.code,{children:"destroy"}),"ed in an unspecified order. The only guarantee about the order in which attachments are destroyed in this case is that the base resource will be the last thing destroyed."]}),`
`,e.jsxs(s.p,{children:["Within the body of an attachment, there is also a ",e.jsx(s.code,{children:"base"})," keyword available, which contains a reference to the attachment's base value; that is, the composite to which the attachment is attached. Its type, therefore, is a reference to the attachment's declared base type. So, for an attachment declared as ",e.jsx(s.code,{children:"access(all) attachment Foo for Bar"}),", the ",e.jsx(s.code,{children:"base"})," field of ",e.jsx(s.code,{children:"Foo"})," would have type ",e.jsx(s.code,{children:"&Bar"}),"."]}),`
`,e.jsx(s.p,{children:"For example, this is a valid declaration of an attachment:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"resource R {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    let x: Int"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    init (_ x: Int) {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        self.x = x"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    fun foo() { ... }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"attachment A for R {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    "})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    let derivedX: Int"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    init (_ scalar: Int) {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        self.derivedX = base.x * scalar"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    access(all)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    fun foo() {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        base.foo()"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["For the purposes of external mutation checks or ",e.jsx(s.a,{href:"./access-control",children:"access control"}),", the attachment is considered a separate declaration from its base type. A developer cannot, therefore, access any ",e.jsx(s.code,{children:"access(self)"})," fields (or ",e.jsx(s.code,{children:"access(contract)"})," fields if the base was defined in a different contract to the attachment) on the ",e.jsx(s.code,{children:"base"})," value, nor can they mutate any array or dictionary typed fields."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeInterface"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" i: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: ["}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeContract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeStruct"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" i: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(i: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" base.b {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".i = base.i "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// cannot access `i` on the `base` value"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        } "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".i = i"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        base.a."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"append"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hello"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// cannot mutate `a` outside of the composite where it was defined"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["Within an attachment's member function, the ",e.jsx(s.code,{children:"base"})," and ",e.jsx(s.code,{children:"self"})," references are entitled to the same entitlements that the function's access modifier specifies. For example, in an attachment declared as ",e.jsx(s.code,{children:"access(all) attachment A for R"}),", within a definition of a function ",e.jsx(s.code,{children:"access(E) fun foo()"}),", the type of ",e.jsx(s.code,{children:"base"})," would be ",e.jsx(s.code,{children:"auth(E) &R"}),", and the type of ",e.jsx(s.code,{children:"self"})," would be ",e.jsx(s.code,{children:"auth(E) &A"}),"."]}),`
`,e.jsx(s.p,{children:"Thus, the following definition works:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        base."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// available because `E` is required above, and thus `base` is type `auth(E) &R`."})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["While this does ",e.jsx(s.strong,{children:"not"})," work:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Bad code example.  Do not use."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        base."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// unavailable because this function has `self` access, and thus `base` only is type `&R`."})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["Note that as a result of how entitlements are propagated to the ",e.jsx(s.code,{children:"self"})," and ",e.jsx(s.code,{children:"base"})," values here, attachment definitions can only support the same entitlements that their base values support; i.e., some attachment ",e.jsx(s.code,{children:"A"})," defined for ",e.jsx(s.code,{children:"R"})," can only use an entitlement ",e.jsx(s.code,{children:"E"})," in its definition if ",e.jsx(s.code,{children:"R"})," also uses ",e.jsx(s.code,{children:"E"})," in its definition (or the definition of any interfaces to which it conforms)."]}),`
`,e.jsx(s.h3,{id:"attachment-types",children:"Attachment types"}),`
`,e.jsxs(s.p,{children:["An attachment declared with ",e.jsx(s.code,{children:"access(all) attachment A for C { ... }"})," will have a nominal type ",e.jsx(s.code,{children:"A"}),"."]}),`
`,e.jsxs(s.p,{children:["It is important to note that attachments are not first-class values, and as such, their usage is limited in certain ways. In particular, their types cannot appear outside of a reference type. So, for example, given an  attachment declaration ",e.jsx(s.code,{children:"attachment A for X {}"}),", the types ",e.jsx(s.code,{children:"A"}),", ",e.jsx(s.code,{children:"A?"}),", ",e.jsx(s.code,{children:"[A]"}),", and ",e.jsx(s.code,{children:"fun(): A"})," are not valid type annotations, while ",e.jsx(s.code,{children:"&A"}),", ",e.jsx(s.code,{children:"&A?"}),", ",e.jsx(s.code,{children:"[&A]"}),", and ",e.jsx(s.code,{children:"fun(): &A"})," are valid."]}),`
`,e.jsx(s.h2,{id:"creating-attachments",children:"Creating attachments"}),`
`,e.jsxs(s.p,{children:["An attachment is created using an ",e.jsx(s.code,{children:"attach"})," expression, where the attachment is both initialized and attached to the base value in a single operation. Attachments are not first-class values; they cannot exist independently of a base value, nor can they be moved around on their own. This means that an ",e.jsx(s.code,{children:"attach"})," expression is the only place in which an attachment constructor can be called. Tightly coupling the creation and the attaching of attachment values helps to make reasoning about attachments simpler for the user. Also for this reason, resource attachments do not need an explicit ",e.jsx(s.code,{children:"<-"})," move operator when they appear in an ",e.jsx(s.code,{children:"attach"})," expression."]}),`
`,e.jsxs(s.p,{children:["An attach expression consists of the ",e.jsx(s.code,{children:"attach"})," keyword, a constructor call for the attachment value, the ",e.jsx(s.code,{children:"to"})," keyword, and an expression that evaluates to the base value for that attachment. Any arguments required by the attachment's initializer are provided in its constructor call:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(x: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2 "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" attach "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"A"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(x: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") to "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"})]})]})})}),`
`,e.jsxs(s.p,{children:["The expression on the right-hand side of the ",e.jsx(s.code,{children:"to"})," keyword must evaluate to a composite value whose type is a subtype of the attachment's base, and is evaluated before the call to the constructor on the left side of ",e.jsx(s.code,{children:"to"}),". This means that the ",e.jsx(s.code,{children:"base"})," value is available inside of the attachment's initializer, but it is important to note that the attachment being created will not be accessible on the ",e.jsx(s.code,{children:"base"})," (see ",e.jsx(s.a,{href:"#accessing-attachments",children:"accessing attachments"})," below) until after the constructor finishes executing:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" I"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"I"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" I"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// has type @R"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2 "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" attach "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"A"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() to "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ok, because `R` is a subtype of `I`, still has type @R"})]})]})})}),`
`,e.jsxs(s.p,{children:["Because attachments are stored on their bases by type, there can only be one attachment of each type present on a value at a time. Cadence will raise a runtime error if a user attempts to add an attachment to a value when one already exists on that value. The type returned by the ",e.jsx(s.code,{children:"attach"})," expression is the same type as the expression on the right-hand side of the ",e.jsx(s.code,{children:"to"}),"; attaching an attachment to a value does not change its type."]}),`
`,e.jsx(s.h2,{id:"accessing-attachments",children:"Accessing attachments"}),`
`,e.jsxs(s.p,{children:["Attachments are accessed on composites via type-indexing: composite values function like a dictionary where the keys are types and the values are attachments. So, given a composite value ",e.jsx(s.code,{children:"v"}),", one can look up the attachment named ",e.jsx(s.code,{children:"A"})," on ",e.jsx(s.code,{children:"v"})," using an indexing syntax:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a = v["}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"A"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// has type `&A?`"})]})})})}),`
`,e.jsxs(s.p,{children:["This syntax requires that ",e.jsx(s.code,{children:"A"})," is a nominal attachment type, and that ",e.jsx(s.code,{children:"v"})," has a composite type that is a subtype of ",e.jsx(s.code,{children:"A"}),"'s declared base type. As mentioned above, attachments are not first-class values, so this indexing returns a reference to the attachment on ",e.jsx(s.code,{children:"v"}),", rather than the attachment itself. If the attachment with the given type does not exist on ",e.jsx(s.code,{children:"v"}),", this expression returns ",e.jsx(s.code,{children:"nil"}),"."]}),`
`,e.jsxs(s.p,{children:["The set of entitlements to which the result of an attachment access is authorized is the same as the set of entitlements to which the base value is authorized. So, for example, given the following definition for ",e.jsx(s.code,{children:"A"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" "})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" F"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" "})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ... "})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { "})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ... "})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"attachment"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" | "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" qux"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { "})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ... "})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ... "})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a = v["}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"A"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]})]})})}),`
`,e.jsxs(s.p,{children:["When ",e.jsx(s.code,{children:"v"})," has type ",e.jsx(s.code,{children:"&R"}),", the resulting type of ",e.jsx(s.code,{children:"a"})," will be an unauthorized ",e.jsx(s.code,{children:"&A"}),". Contrarily, if ",e.jsx(s.code,{children:"v"})," has type ",e.jsx(s.code,{children:"auth(E) &R"}),", then the type of ",e.jsx(s.code,{children:"a"})," will be authorized to the same: ",e.jsx(s.code,{children:"auth(E) &A"}),". Finally, when ",e.jsx(s.code,{children:"v"})," is not a reference (i.e., an owned value of type ",e.jsx(s.code,{children:"R"}),"), then ",e.jsx(s.code,{children:"a"}),' will be "fully entitled" to ',e.jsx(s.code,{children:"A"}),"; it will be granted all the entitlements mentioned by ",e.jsx(s.code,{children:"A"}),", i.e., in this case, it will have type ",e.jsx(s.code,{children:"auth(E, F) &A"}),"."]}),`
`,e.jsxs(s.p,{children:["This is roughly equivalent to the behavior of the ",e.jsx(s.code,{children:"Identity"})," ",e.jsx(s.a,{href:"./access-control#entitlement-mappings",children:"entitlement mapping"}),"; indeed, attachments can be thought of as being ",e.jsx(s.code,{children:"Identity"}),"-mapped fields on their base value."]}),`
`,e.jsx(s.h2,{id:"removing-attachments",children:"Removing attachments"}),`
`,e.jsxs(s.p,{children:["Attachments can be removed from a value with a ",e.jsx(s.code,{children:"remove"})," statement. The statement consists of the ",e.jsx(s.code,{children:"remove"})," keyword, the nominal type for the attachment to be removed, the ",e.jsx(s.code,{children:"from"})," keyword, and the value from which the attachment is meant to be removed."]}),`
`,e.jsxs(s.p,{children:["The value on the right-hand side of ",e.jsx(s.code,{children:"from"})," must be a composite value whose type is a subtype of the attachment type's declared base."]}),`
`,e.jsxs(s.p,{children:["For example, to remove an ",e.jsx(s.code,{children:"A"})," attachment from some resource ",e.jsx(s.code,{children:"r"})," whose type supports that attachment:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"remove"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" A"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r"})]})})})}),`
`,e.jsxs(s.p,{children:["After the statement executes, the composite value on the right-hand side of ",e.jsx(s.code,{children:"from"})," will no longer contain the attachment. If the value does not contain the attachment that appears after the ",e.jsx(s.code,{children:"remove"})," keyword, this statement has no effect."]}),`
`,e.jsx(s.p,{children:"Attachments can be removed from a type in any order, so developers should take care not to design any attachments that rely on specific behaviors of other attachments, as there is no requirement that an attachment depend on another or that a type has a given attachment when another attachment is present."}),`
`,e.jsxs(s.p,{children:["If a resource containing attachments is ",e.jsx(s.code,{children:"destroy"}),"ed, all of its attachments will be ",e.jsx(s.code,{children:"destroy"}),"ed in an arbitrary order."]}),`
`,e.jsx(s.h2,{id:"attachment-iteration",children:"Attachment iteration"}),`
`,e.jsxs(s.p,{children:["Attachments can be iterated over using the ",e.jsx(s.code,{children:"forEachAttachment"})," function, a built-in function provided on types which support attachments. The signature is as follows:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// for a struct"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" forEachAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(&"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyStructAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")){}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// for a resource"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" forEachAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(&"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyResourceAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")){} "})]})]})})}),`
`,e.jsx(s.p,{children:"The function takes a single argument, a callback function that accepts a reference to an attachment of the appropriate type. The callback function is called for each attachment present on the value, in an unspecified order."}),`
`,e.jsxs(s.p,{children:["For example, to iterate over all attachments on a resource ",e.jsx(s.code,{children:"r"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"forEachAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(attachmentRef: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyResourceAttachment"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Do something with each attachment"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"})"})})]})})}),`
`]})}function r(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(t,{...i})}):t(i)}export{a as _markdown,r as default,h as frontmatter,l as structuredData,c as toc};
