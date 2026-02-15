import{j as e}from"./main-BXy83AsK.js";let c=`

The following explains what to do when facing an incompatible upgrade for a contract.

How to deploy [#how-to-deploy]

Please don't perform incompatible upgrades between contract versions in the same account. There is too much that can go wrong.

You can make [compatible upgrades] and then run a post-upgrade function on the new contract code if needed.

If you must replace your contract rather than update it, the simplest solution is to add or increase a suffix on any named paths in the contract code (e.g., \`/public/MyProjectVault\` becomes \`/public/MyProjectVault002\`) in addition to making the incompatible changes, then create a new account and deploy the updated contract there.

:::note
Flow identifies types relative to addresses, so you will also need to provide *upgrade transactions* to exchange the old contract's resources for the new contract's ones. Make sure to inform users as soon as possible when and how they will need to perform this task.
:::
If you absolutely must keep the old address when making an incompatible upgrade, then you do so at your own risk. Make sure you perform the following actions in this exact order:

1. Delete any resources used in the contract account (e.g., an Admin resource).
2. Delete the contract from the account.
3. Deploy the new contract to the account.

:::warning
If any user accounts contain \`structs\` or \`resources\` from the *old* version of the contract that have been replaced with incompatible versions in the new one, **they will not load and will cause transactions that attempt to access them to crash**. For this reason, once any users have received \`structs\` or \`resources\` from the contract, this method of making an incompatible upgrade should not be attempted!
:::

{/* Relative links. Will not render on the page */}

[compatible upgrades]: ./language/contract-updatability
`,r={title:"Contract Upgrades with Incompatible Changes"},s={contents:[{heading:void 0,content:"The following explains what to do when facing an incompatible upgrade for a contract."},{heading:"how-to-deploy",content:"Please don't perform incompatible upgrades between contract versions in the same account. There is too much that can go wrong."},{heading:"how-to-deploy",content:"You can make [compatible upgrades] and then run a post-upgrade function on the new contract code if needed."},{heading:"how-to-deploy",content:"If you must replace your contract rather than update it, the simplest solution is to add or increase a suffix on any named paths in the contract code (e.g., `/public/MyProjectVault` becomes `/public/MyProjectVault002`) in addition to making the incompatible changes, then create a new account and deploy the updated contract there."},{heading:"how-to-deploy",content:`:::note
Flow identifies types relative to addresses, so you will also need to provide *upgrade transactions* to exchange the old contract's resources for the new contract's ones. Make sure to inform users as soon as possible when and how they will need to perform this task.
:::
If you absolutely must keep the old address when making an incompatible upgrade, then you do so at your own risk. Make sure you perform the following actions in this exact order:`},{heading:"how-to-deploy",content:"Delete any resources used in the contract account (e.g., an Admin resource)."},{heading:"how-to-deploy",content:"Delete the contract from the account."},{heading:"how-to-deploy",content:"Deploy the new contract to the account."},{heading:"how-to-deploy",content:":::warning\nIf any user accounts contain `structs` or `resources` from the *old* version of the contract that have been replaced with incompatible versions in the new one, **they will not load and will cause transactions that attempt to access them to crash**. For this reason, once any users have received `structs` or `resources` from the contract, this method of making an incompatible upgrade should not be attempted!\n:::"}],headings:[{id:"how-to-deploy",content:"How to deploy"}]};const i=[{depth:2,url:"#how-to-deploy",title:e.jsx(e.Fragment,{children:"How to deploy"})}];function o(n){const t={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"The following explains what to do when facing an incompatible upgrade for a contract."}),`
`,e.jsx(t.h2,{id:"how-to-deploy",children:"How to deploy"}),`
`,e.jsx(t.p,{children:"Please don't perform incompatible upgrades between contract versions in the same account. There is too much that can go wrong."}),`
`,e.jsxs(t.p,{children:["You can make ",e.jsx(t.a,{href:"./language/contract-updatability",children:"compatible upgrades"})," and then run a post-upgrade function on the new contract code if needed."]}),`
`,e.jsxs(t.p,{children:["If you must replace your contract rather than update it, the simplest solution is to add or increase a suffix on any named paths in the contract code (e.g., ",e.jsx(t.code,{children:"/public/MyProjectVault"})," becomes ",e.jsx(t.code,{children:"/public/MyProjectVault002"}),") in addition to making the incompatible changes, then create a new account and deploy the updated contract there."]}),`
`,e.jsxs(t.p,{children:[`:::note
Flow identifies types relative to addresses, so you will also need to provide `,e.jsx(t.em,{children:"upgrade transactions"}),` to exchange the old contract's resources for the new contract's ones. Make sure to inform users as soon as possible when and how they will need to perform this task.
:::
If you absolutely must keep the old address when making an incompatible upgrade, then you do so at your own risk. Make sure you perform the following actions in this exact order:`]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Delete any resources used in the contract account (e.g., an Admin resource)."}),`
`,e.jsx(t.li,{children:"Delete the contract from the account."}),`
`,e.jsx(t.li,{children:"Deploy the new contract to the account."}),`
`]}),`
`,e.jsxs(t.p,{children:[`:::warning
If any user accounts contain `,e.jsx(t.code,{children:"structs"})," or ",e.jsx(t.code,{children:"resources"})," from the ",e.jsx(t.em,{children:"old"})," version of the contract that have been replaced with incompatible versions in the new one, ",e.jsx(t.strong,{children:"they will not load and will cause transactions that attempt to access them to crash"}),". For this reason, once any users have received ",e.jsx(t.code,{children:"structs"})," or ",e.jsx(t.code,{children:"resources"}),` from the contract, this method of making an incompatible upgrade should not be attempted!
:::`]}),`
`]})}function d(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{c as _markdown,d as default,r as frontmatter,s as structuredData,i as toc};
