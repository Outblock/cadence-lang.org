import{j as e}from"./main-BXy83AsK.js";let a=`

In this tutorial, we're going to deploy a contract that allows users to vote on multiple proposals that a voting administrator controls.

***

With the advent of blockchain technology and smart contracts, it has become popular to try to create decentralized voting mechanisms that allow large groups of users to vote completely on chain. This tutorial will provide an example for how this might be achieved by using a resource-oriented programming model.

We'll take you through these steps to get comfortable with the Voting contract.

1. Deploy the contract to account \`0x06\`
2. Create proposals for users to vote on
3. Use a transaction with multiple signers to directly transfer the \`Ballot\` resource to another account.
4. Record and cast your vote in the central Voting contract
5. Read the results of the vote

Open the starter code for this tutorial in the [Flow Playground](https://play.flow.com/e8e2af39-370d-4a52-9f0b-bfb3b12c7eff)

A Voting Contract in Cadence [#a-voting-contract-in-cadence]

In this contract, a Ballot is represented as a resource.

An administrator can give Ballots to other accounts, then those accounts mark which proposals they vote for and submit the Ballot to the central smart contract to have their votes recorded.

Using a [resource](../language/resources) type is logical for this application, because if a user wants to delegate their vote, they can send that Ballot to another account, and the use case of voting ballots benefits from the uniqueness and existence guarantees inherent to resources.

Write the Contract [#write-the-contract]

Open Contract 1 - the \`ApprovalVoting\` contract. Follow the instructions in the comments of the contract to write your own approval voting contract.

Instructions for transactions are also included in the sample transactions.

\`\`\`cadence ApprovalVoting.cdc
/*
*
*   In this example, we want to create a simple approval voting contract
*   where a polling place issues ballots to addresses.
*
*   The run a vote, the Admin deploys the smart contract,
*   then initializes the proposals
*   using the initialize_proposals.cdc transaction.
*   The array of proposals cannot be modified after it has been initialized.
*
*   Then they will give ballots to users by
*   using the issue_ballot.cdc transaction.
*
*   Every user with a ballot is allowed to approve any number of proposals.
*   A user can choose their votes and cast them
*   with the cast_vote.cdc transaction.
*
*.  See if you can code it yourself!
*
*/

access(all)
contract ApprovalVoting {

    // Field: An array of strings representing proposals to be approved

    // Field: A dictionary mapping the proposal index to the number of votes per proposal

    // Entitlement: Admin entitlement that restricts the privileged fields
    // of the Admin resource

    // Resource: Ballot resource that is issued to users.
    // When a user gets a Ballot object, they call the \`vote\` function
    // to include their votes for each proposal, and then cast it in the smart contract
    // using the \`cast\` function to have their vote included in the polling
    // Remember to track which proposals a user has voted yes for in the Ballot resource
    // and remember to include proper pre and post conditions to ensure that no mistakes are made
    // when a user submits their vote
    access(all) resource Ballot {

    }

    // Resource: Administrator of the voting process
    // initialize the proposals and to provide a function for voters
    // to get a ballot resource
    // Remember to include proper conditions for each function!
    // Also make sure that the privileged fields are secured with entitlements!
    access(all) resource Administrator {

    }

    // Public function: A user can create a capability to their ballot resource
    // and send it to this function so its votes are tallied
    // Remember to include a provision so that a ballot can only be cast once!

    // initialize the contract fields by setting the proposals and votes to empty
    // and create a new Admin resource to put in storage
    init() {

    }
}

\`\`\`

Deploy the Contract [#deploy-the-contract]

1. In the bottom right deployment modal, press the arrow to expand and make sure account \`0x06\` is selected as the signer.
2. Click the Deploy button to deploy it to account \`0x06\`

Perform Voting [#perform-voting]

Performing the common actions in this voting contract only takes three types of transactions.

1. Initialize Proposals
2. Send \`Ballot\` to a voter
3. Cast Vote

We have a transaction for each step that we provide a skeleton of for you.
With the \`ApprovalVoting\` contract deployed to account \`0x06\`:

1. Open Transaction 1 which should have \`Create Proposals\`
2. Submit the transaction with account \`0x06\` selected as the only signer.

\`\`\`cadence CreateProposals.cdc
import ApprovalVoting from 0x06

// This transaction allows the administrator of the Voting contract
// to create new proposals for voting and save them to the smart contract

transaction {
    // Fill in auth() with the correct entitlements you need!
    prepare(admin: auth()) {

        // borrow a reference to the admin Resource
        // remember to use descriptive error messages!

        // Call the initializeProposals function
        // to create the proposals array as an array of strings
        // Maybe we could create two proposals for the local basketball league:
        // ["Longer Shot Clock", "Trampolines instead of hardwood floors"]

        // Issue and public a public capability to the Administrator resource
        // so that voters can get their ballots!
    }

    post {
        // Verify that the proposals were initialized properly
    }

}
\`\`\`

This transaction allows the \`Administrator\` of the contract to create new proposals for voting and save them to the smart contract. They do this by calling the \`initializeProposals\` function on their stored \`Administrator\` resource, giving it two new proposals to vote on. We use the \`post\` block to ensure that there were two proposals created, like we wished for.

Next, the \`Administrator\` needs to hand out \`Ballot\`s to the voters. There isn't an easy \`deposit\` function this time for them to send a \`Ballot\` to another account, so how would they do it?

Putting Resource Creation in public capabilities [#putting-resource-creation-in-public-capabilities]

Unlike our other tutorial contracts, the Approval Voting contract
puts its Ballot creation function in a resource instead of as a public function in a contract.

This way, the admin can control who can and cannot create a Ballot resource. There are also ways to consolidate all of the voting logic into the Admin resource so that there can be multiple sets of proposals being voted on at the same time without having to deploy a new contract for each one!

Here, we're just exposing the create ballot function through a public capability for simplicity, so lets use the transaction for a voter to create a ballot.

1. Open the \`Create Ballot\` transaction.
2. Select account \`0x07\` as a signer.
3. Submit the transaction by clicking the \`Send\` button

\`\`\`cadence CreateBallot.cdc

import ApprovalVoting from 0x06

// This transaction allows a user
// to create a new ballot and store it in their account
// by calling the public function on the Admin resource
// through its public capability

transaction {
    // fill in the correct entitlements!
    prepare(voter: auth() &Account) {

        // Get the administrator's public account object
        // and borrow a reference to their Administrator resource

        // create a new Ballot by calling the issueBallot
        // function of the admin Reference

        // store that ballot in the voter's account storage
    }
}

\`\`\`

After this transaction, account \`0x07\` should now have a \`Ballot\` resource object in its account storage. You can confirm this by selecting \`0x07\` from the lower-left sidebar and seeing \`Ballot\` resource listed under the \`Storage\` field.

Casting a Vote [#casting-a-vote]

Now that account \`0x07\` has a \`Ballot\` in their storage, they can cast their vote. To do this, they will call the \`vote\` method on their stored resource, then cast that \`Ballot\` by passing it to the \`cast\` function in the main smart contract.

1. Open the \`Cast Ballot\` transaction.
2. Select account \`0x07\` as the only transaction signer.
3. Click the \`send\` button to submit the transaction.

\`\`\`cadence CastBallot.cdc
import ApprovalVoting from 0x06

// This transaction allows a voter to select the votes they would like to make
// and cast that vote by using the cast vote function
// of the ApprovalVoting smart contract

transaction {
    // fill in the correct entitlements!
    prepare(voter: auth() &Account) {

        // Borrow a reference to the Ballot resource in the Voter's storage

        // Vote on the proposal

        // Issue a capability to the Ballot resource in the voter's storage

        // Cast the vote by submitting it to the smart contract
    }

    post {
        // verify that the votes were cast properly
    }
}
\`\`\`

In this transaction, the user votes for one of the proposals by submitting
their votes on their own ballot and then sending the capability.

Reading the result of the vote [#reading-the-result-of-the-vote]

At any time, anyone could read the current tally of votes by directly reading the fields of the contract. You can use a script to do that, since it does not need to modify storage.

1. Open the \`Get Votes\` script.
2. Click the \`execute\` button to run the script.

\`\`\`cadence GetVotes.cdc
import ApprovalVoting from 0x06

// This script allows anyone to read the tallied votes for each proposal
//

// Fill in a return type that can properly represent the number of votes
// for each proposal
// This might need a custom struct to represent the data
access(all) fun main(): {

    // Access the public fields of the contract to get
    // the proposal names and vote counts

    // return them to the calling context

}
\`\`\`

The return type should reflect the number of votes that were cast for each proposal with the \`Cast Vote\` transaction.

Other Voting possibilities [#other-voting-possibilities]

This contract was a very simple example of voting in Cadence. It clearly couldn't be used for a real-world voting situation, but hopefully you can see what kind of features could be added to it to ensure practicality and security.
`,o={title:"Voting Contract"},l={contents:[{heading:void 0,content:"In this tutorial, we're going to deploy a contract that allows users to vote on multiple proposals that a voting administrator controls."},{heading:void 0,content:"With the advent of blockchain technology and smart contracts, it has become popular to try to create decentralized voting mechanisms that allow large groups of users to vote completely on chain. This tutorial will provide an example for how this might be achieved by using a resource-oriented programming model."},{heading:void 0,content:"We'll take you through these steps to get comfortable with the Voting contract."},{heading:void 0,content:"Deploy the contract to account `0x06`"},{heading:void 0,content:"Create proposals for users to vote on"},{heading:void 0,content:"Use a transaction with multiple signers to directly transfer the `Ballot` resource to another account."},{heading:void 0,content:"Record and cast your vote in the central Voting contract"},{heading:void 0,content:"Read the results of the vote"},{heading:void 0,content:"Open the starter code for this tutorial in the Flow Playground"},{heading:"a-voting-contract-in-cadence",content:"In this contract, a Ballot is represented as a resource."},{heading:"a-voting-contract-in-cadence",content:"An administrator can give Ballots to other accounts, then those accounts mark which proposals they vote for and submit the Ballot to the central smart contract to have their votes recorded."},{heading:"a-voting-contract-in-cadence",content:"Using a resource type is logical for this application, because if a user wants to delegate their vote, they can send that Ballot to another account, and the use case of voting ballots benefits from the uniqueness and existence guarantees inherent to resources."},{heading:"write-the-contract",content:"Open Contract 1 - the `ApprovalVoting` contract. Follow the instructions in the comments of the contract to write your own approval voting contract."},{heading:"write-the-contract",content:"Instructions for transactions are also included in the sample transactions."},{heading:"deploy-the-contract",content:"In the bottom right deployment modal, press the arrow to expand and make sure account `0x06` is selected as the signer."},{heading:"deploy-the-contract",content:"Click the Deploy button to deploy it to account `0x06`"},{heading:"perform-voting",content:"Performing the common actions in this voting contract only takes three types of transactions."},{heading:"perform-voting",content:"Initialize Proposals"},{heading:"perform-voting",content:"Send `Ballot` to a voter"},{heading:"perform-voting",content:"Cast Vote"},{heading:"perform-voting",content:"We have a transaction for each step that we provide a skeleton of for you.\nWith the `ApprovalVoting` contract deployed to account `0x06`:"},{heading:"perform-voting",content:"Open Transaction 1 which should have `Create Proposals`"},{heading:"perform-voting",content:"Submit the transaction with account `0x06` selected as the only signer."},{heading:"perform-voting",content:"This transaction allows the `Administrator` of the contract to create new proposals for voting and save them to the smart contract. They do this by calling the `initializeProposals` function on their stored `Administrator` resource, giving it two new proposals to vote on. We use the `post` block to ensure that there were two proposals created, like we wished for."},{heading:"perform-voting",content:"Next, the `Administrator` needs to hand out `Ballot`s to the voters. There isn't an easy `deposit` function this time for them to send a `Ballot` to another account, so how would they do it?"},{heading:"putting-resource-creation-in-public-capabilities",content:`Unlike our other tutorial contracts, the Approval Voting contract
puts its Ballot creation function in a resource instead of as a public function in a contract.`},{heading:"putting-resource-creation-in-public-capabilities",content:"This way, the admin can control who can and cannot create a Ballot resource. There are also ways to consolidate all of the voting logic into the Admin resource so that there can be multiple sets of proposals being voted on at the same time without having to deploy a new contract for each one!"},{heading:"putting-resource-creation-in-public-capabilities",content:"Here, we're just exposing the create ballot function through a public capability for simplicity, so lets use the transaction for a voter to create a ballot."},{heading:"putting-resource-creation-in-public-capabilities",content:"Open the `Create Ballot` transaction."},{heading:"putting-resource-creation-in-public-capabilities",content:"Select account `0x07` as a signer."},{heading:"putting-resource-creation-in-public-capabilities",content:"Submit the transaction by clicking the `Send` button"},{heading:"putting-resource-creation-in-public-capabilities",content:"After this transaction, account `0x07` should now have a `Ballot` resource object in its account storage. You can confirm this by selecting `0x07` from the lower-left sidebar and seeing `Ballot` resource listed under the `Storage` field."},{heading:"casting-a-vote",content:"Now that account `0x07` has a `Ballot` in their storage, they can cast their vote. To do this, they will call the `vote` method on their stored resource, then cast that `Ballot` by passing it to the `cast` function in the main smart contract."},{heading:"casting-a-vote",content:"Open the `Cast Ballot` transaction."},{heading:"casting-a-vote",content:"Select account `0x07` as the only transaction signer."},{heading:"casting-a-vote",content:"Click the `send` button to submit the transaction."},{heading:"casting-a-vote",content:`In this transaction, the user votes for one of the proposals by submitting
their votes on their own ballot and then sending the capability.`},{heading:"reading-the-result-of-the-vote",content:"At any time, anyone could read the current tally of votes by directly reading the fields of the contract. You can use a script to do that, since it does not need to modify storage."},{heading:"reading-the-result-of-the-vote",content:"Open the `Get Votes` script."},{heading:"reading-the-result-of-the-vote",content:"Click the `execute` button to run the script."},{heading:"reading-the-result-of-the-vote",content:"The return type should reflect the number of votes that were cast for each proposal with the `Cast Vote` transaction."},{heading:"other-voting-possibilities",content:"This contract was a very simple example of voting in Cadence. It clearly couldn't be used for a real-world voting situation, but hopefully you can see what kind of features could be added to it to ensure practicality and security."}],headings:[{id:"a-voting-contract-in-cadence",content:"A Voting Contract in Cadence"},{id:"write-the-contract",content:"Write the Contract"},{id:"deploy-the-contract",content:"Deploy the Contract"},{id:"perform-voting",content:"Perform Voting"},{id:"putting-resource-creation-in-public-capabilities",content:"Putting Resource Creation in public capabilities"},{id:"casting-a-vote",content:"Casting a Vote"},{id:"reading-the-result-of-the-vote",content:"Reading the result of the vote"},{id:"other-voting-possibilities",content:"Other Voting possibilities"}]};const r=[{depth:2,url:"#a-voting-contract-in-cadence",title:e.jsx(e.Fragment,{children:"A Voting Contract in Cadence"})},{depth:2,url:"#write-the-contract",title:e.jsx(e.Fragment,{children:"Write the Contract"})},{depth:2,url:"#deploy-the-contract",title:e.jsx(e.Fragment,{children:"Deploy the Contract"})},{depth:2,url:"#perform-voting",title:e.jsx(e.Fragment,{children:"Perform Voting"})},{depth:2,url:"#putting-resource-creation-in-public-capabilities",title:e.jsx(e.Fragment,{children:"Putting Resource Creation in public capabilities"})},{depth:2,url:"#casting-a-vote",title:e.jsx(e.Fragment,{children:"Casting a Vote"})},{depth:2,url:"#reading-the-result-of-the-vote",title:e.jsx(e.Fragment,{children:"Reading the result of the vote"})},{depth:2,url:"#other-voting-possibilities",title:e.jsx(e.Fragment,{children:"Other Voting possibilities"})}];function s(n){const t={a:"a",code:"code",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In this tutorial, we're going to deploy a contract that allows users to vote on multiple proposals that a voting administrator controls."}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.p,{children:"With the advent of blockchain technology and smart contracts, it has become popular to try to create decentralized voting mechanisms that allow large groups of users to vote completely on chain. This tutorial will provide an example for how this might be achieved by using a resource-oriented programming model."}),`
`,e.jsx(t.p,{children:"We'll take you through these steps to get comfortable with the Voting contract."}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Deploy the contract to account ",e.jsx(t.code,{children:"0x06"})]}),`
`,e.jsx(t.li,{children:"Create proposals for users to vote on"}),`
`,e.jsxs(t.li,{children:["Use a transaction with multiple signers to directly transfer the ",e.jsx(t.code,{children:"Ballot"})," resource to another account."]}),`
`,e.jsx(t.li,{children:"Record and cast your vote in the central Voting contract"}),`
`,e.jsx(t.li,{children:"Read the results of the vote"}),`
`]}),`
`,e.jsxs(t.p,{children:["Open the starter code for this tutorial in the ",e.jsx(t.a,{href:"https://play.flow.com/e8e2af39-370d-4a52-9f0b-bfb3b12c7eff",children:"Flow Playground"})]}),`
`,e.jsx(t.h2,{id:"a-voting-contract-in-cadence",children:"A Voting Contract in Cadence"}),`
`,e.jsx(t.p,{children:"In this contract, a Ballot is represented as a resource."}),`
`,e.jsx(t.p,{children:"An administrator can give Ballots to other accounts, then those accounts mark which proposals they vote for and submit the Ballot to the central smart contract to have their votes recorded."}),`
`,e.jsxs(t.p,{children:["Using a ",e.jsx(t.a,{href:"../language/resources",children:"resource"})," type is logical for this application, because if a user wants to delegate their vote, they can send that Ballot to another account, and the use case of voting ballots benefits from the uniqueness and existence guarantees inherent to resources."]}),`
`,e.jsx(t.h2,{id:"write-the-contract",children:"Write the Contract"}),`
`,e.jsxs(t.p,{children:["Open Contract 1 - the ",e.jsx(t.code,{children:"ApprovalVoting"})," contract. Follow the instructions in the comments of the contract to write your own approval voting contract."]}),`
`,e.jsx(t.p,{children:"Instructions for transactions are also included in the sample transactions."}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   In this example, we want to create a simple approval voting contract"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   where a polling place issues ballots to addresses."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   The run a vote, the Admin deploys the smart contract,"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   then initializes the proposals"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   using the initialize_proposals.cdc transaction."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   The array of proposals cannot be modified after it has been initialized."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   Then they will give ballots to users by"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   using the issue_ballot.cdc transaction."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   Every user with a ballot is allowed to approve any number of proposals."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   A user can choose their votes and cast them"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*   with the cast_vote.cdc transaction."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*.  See if you can code it yourself!"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*/"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ApprovalVoting"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Field: An array of strings representing proposals to be approved"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Field: A dictionary mapping the proposal index to the number of votes per proposal"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Entitlement: Admin entitlement that restricts the privileged fields"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // of the Admin resource"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Resource: Ballot resource that is issued to users."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // When a user gets a Ballot object, they call the `vote` function"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // to include their votes for each proposal, and then cast it in the smart contract"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // using the `cast` function to have their vote included in the polling"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Remember to track which proposals a user has voted yes for in the Ballot resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and remember to include proper pre and post conditions to ensure that no mistakes are made"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // when a user submits their vote"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Ballot"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Resource: Administrator of the voting process"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // initialize the proposals and to provide a function for voters"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // to get a ballot resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Remember to include proper conditions for each function!"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Also make sure that the privileged fields are secured with entitlements!"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Administrator"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Public function: A user can create a capability to their ballot resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and send it to this function so its votes are tallied"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Remember to include a provision so that a ballot can only be cast once!"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // initialize the contract fields by setting the proposals and votes to empty"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and create a new Admin resource to put in storage"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.h2,{id:"deploy-the-contract",children:"Deploy the Contract"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["In the bottom right deployment modal, press the arrow to expand and make sure account ",e.jsx(t.code,{children:"0x06"})," is selected as the signer."]}),`
`,e.jsxs(t.li,{children:["Click the Deploy button to deploy it to account ",e.jsx(t.code,{children:"0x06"})]}),`
`]}),`
`,e.jsx(t.h2,{id:"perform-voting",children:"Perform Voting"}),`
`,e.jsx(t.p,{children:"Performing the common actions in this voting contract only takes three types of transactions."}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Initialize Proposals"}),`
`,e.jsxs(t.li,{children:["Send ",e.jsx(t.code,{children:"Ballot"})," to a voter"]}),`
`,e.jsx(t.li,{children:"Cast Vote"}),`
`]}),`
`,e.jsxs(t.p,{children:[`We have a transaction for each step that we provide a skeleton of for you.
With the `,e.jsx(t.code,{children:"ApprovalVoting"})," contract deployed to account ",e.jsx(t.code,{children:"0x06"}),":"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open Transaction 1 which should have ",e.jsx(t.code,{children:"Create Proposals"})]}),`
`,e.jsxs(t.li,{children:["Submit the transaction with account ",e.jsx(t.code,{children:"0x06"})," selected as the only signer."]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ApprovalVoting"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This transaction allows the administrator of the Voting contract"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// to create new proposals for voting and save them to the smart contract"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Fill in auth() with the correct entitlements you need!"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(admin: "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // borrow a reference to the admin Resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // remember to use descriptive error messages!"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Call the initializeProposals function"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // to create the proposals array as an array of strings"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Maybe we could create two proposals for the local basketball league:"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'        // ["Longer Shot Clock", "Trampolines instead of hardwood floors"]'})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Issue and public a public capability to the Administrator resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // so that voters can get their ballots!"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Verify that the proposals were initialized properly"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(t.p,{children:["This transaction allows the ",e.jsx(t.code,{children:"Administrator"})," of the contract to create new proposals for voting and save them to the smart contract. They do this by calling the ",e.jsx(t.code,{children:"initializeProposals"})," function on their stored ",e.jsx(t.code,{children:"Administrator"})," resource, giving it two new proposals to vote on. We use the ",e.jsx(t.code,{children:"post"})," block to ensure that there were two proposals created, like we wished for."]}),`
`,e.jsxs(t.p,{children:["Next, the ",e.jsx(t.code,{children:"Administrator"})," needs to hand out ",e.jsx(t.code,{children:"Ballot"}),"s to the voters. There isn't an easy ",e.jsx(t.code,{children:"deposit"})," function this time for them to send a ",e.jsx(t.code,{children:"Ballot"})," to another account, so how would they do it?"]}),`
`,e.jsx(t.h2,{id:"putting-resource-creation-in-public-capabilities",children:"Putting Resource Creation in public capabilities"}),`
`,e.jsx(t.p,{children:`Unlike our other tutorial contracts, the Approval Voting contract
puts its Ballot creation function in a resource instead of as a public function in a contract.`}),`
`,e.jsx(t.p,{children:"This way, the admin can control who can and cannot create a Ballot resource. There are also ways to consolidate all of the voting logic into the Admin resource so that there can be multiple sets of proposals being voted on at the same time without having to deploy a new contract for each one!"}),`
`,e.jsx(t.p,{children:"Here, we're just exposing the create ballot function through a public capability for simplicity, so lets use the transaction for a voter to create a ballot."}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"Create Ballot"})," transaction."]}),`
`,e.jsxs(t.li,{children:["Select account ",e.jsx(t.code,{children:"0x07"})," as a signer."]}),`
`,e.jsxs(t.li,{children:["Submit the transaction by clicking the ",e.jsx(t.code,{children:"Send"})," button"]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ApprovalVoting"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This transaction allows a user"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// to create a new ballot and store it in their account"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// by calling the public function on the Admin resource"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// through its public capability"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // fill in the correct entitlements!"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(voter: "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() &"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Get the administrator's public account object"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // and borrow a reference to their Administrator resource"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // create a new Ballot by calling the issueBallot"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // function of the admin Reference"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // store that ballot in the voter's account storage"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(t.p,{children:["After this transaction, account ",e.jsx(t.code,{children:"0x07"})," should now have a ",e.jsx(t.code,{children:"Ballot"})," resource object in its account storage. You can confirm this by selecting ",e.jsx(t.code,{children:"0x07"})," from the lower-left sidebar and seeing ",e.jsx(t.code,{children:"Ballot"})," resource listed under the ",e.jsx(t.code,{children:"Storage"})," field."]}),`
`,e.jsx(t.h2,{id:"casting-a-vote",children:"Casting a Vote"}),`
`,e.jsxs(t.p,{children:["Now that account ",e.jsx(t.code,{children:"0x07"})," has a ",e.jsx(t.code,{children:"Ballot"})," in their storage, they can cast their vote. To do this, they will call the ",e.jsx(t.code,{children:"vote"})," method on their stored resource, then cast that ",e.jsx(t.code,{children:"Ballot"})," by passing it to the ",e.jsx(t.code,{children:"cast"})," function in the main smart contract."]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"Cast Ballot"})," transaction."]}),`
`,e.jsxs(t.li,{children:["Select account ",e.jsx(t.code,{children:"0x07"})," as the only transaction signer."]}),`
`,e.jsxs(t.li,{children:["Click the ",e.jsx(t.code,{children:"send"})," button to submit the transaction."]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ApprovalVoting"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This transaction allows a voter to select the votes they would like to make"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// and cast that vote by using the cast vote function"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// of the ApprovalVoting smart contract"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // fill in the correct entitlements!"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(voter: "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() &"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Borrow a reference to the Ballot resource in the Voter's storage"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Vote on the proposal"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Issue a capability to the Ballot resource in the voter's storage"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Cast the vote by submitting it to the smart contract"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // verify that the votes were cast properly"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.p,{children:`In this transaction, the user votes for one of the proposals by submitting
their votes on their own ballot and then sending the capability.`}),`
`,e.jsx(t.h2,{id:"reading-the-result-of-the-vote",children:"Reading the result of the vote"}),`
`,e.jsx(t.p,{children:"At any time, anyone could read the current tally of votes by directly reading the fields of the contract. You can use a script to do that, since it does not need to modify storage."}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"Get Votes"})," script."]}),`
`,e.jsxs(t.li,{children:["Click the ",e.jsx(t.code,{children:"execute"})," button to run the script."]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ApprovalVoting"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This script allows anyone to read the tallied votes for each proposal"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Fill in a return type that can properly represent the number of votes"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// for each proposal"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This might need a custom struct to represent the data"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): {"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Access the public fields of the contract to get"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // the proposal names and vote counts"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // return them to the calling context"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(t.p,{children:["The return type should reflect the number of votes that were cast for each proposal with the ",e.jsx(t.code,{children:"Cast Vote"})," transaction."]}),`
`,e.jsx(t.h2,{id:"other-voting-possibilities",children:"Other Voting possibilities"}),`
`,e.jsx(t.p,{children:"This contract was a very simple example of voting in Cadence. It clearly couldn't be used for a real-world voting situation, but hopefully you can see what kind of features could be added to it to ensure practicality and security."})]})}function h(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,h as default,o as frontmatter,l as structuredData,r as toc};
