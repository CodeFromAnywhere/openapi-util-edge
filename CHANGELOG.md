# June 23, 2024

✅ Finish the apis pruneOpeanpi and summarizeOpenapi

✅ As a POC use the prompt made in prompts.json and generate the openapi with claude 3.5 manually, for now. If it's promising enough, put prompt schema on github (with claude key as auth?) **It's working**

✅ As a POC, Make a GPT that can find the operationIds you need, makes the pruned openapis, and writes typescript code based on a predefined convention. **Beautiful!**

✅ Edit https://chatgpt.com/gpts/editor/g-Gjix3kFre so it actually generates code with the pruned openapi

✅ Make a beautiful landing README at https://github.com/CodeFromAnywhere/Myelin

# July 6th, 2024

✅ Merged with openapi-util to make it both a serverless function and an npm package in a single repo.

1. execute `getOpenapiCombination.md`. Now we have a `OpenapiCombinationArray`
2. execute `writeEndpoint.md`. Now we have some typescript code.
3. execute `openapiCombinationToSdkConfig` and `generateSdk`. Now we have the SDK that we require.

Stringing it all together, it goes from a user request to an object of files + env.

✅ Build a JSON array that has the name, domain, (sub)category, description, filter-constraints, and embedding of description.

✅ Now an LLM can make an informed choice to use the service combination that it needs.

✅ Now split the requirements into a list of requirements for each service (that still has a higher goal summary and services used above). Now get the exact endpoints for each service that is needed for each requirement.

✅ Now create a new openapi that combines all these openapis into one.

✅ Now we can have a summary of that and an SDK.

<!--
I think this would probably perform incredibly well for an API search engine. You paste in your requirements and it will do this entire pipeline and come back to you with an SDK and code even.

The funny part is I'm obsessed with OAuth but the above is also a lot of work, whereas if we generate code, we might as well just generate code in which the dev can make their own auths and hence we wouldn't need to have hosted oauth at all.

For lots of devs it wouldn't be a must.
-->

# TODO FIRST (July 6th)

🤔 As this will become the entrypoint of actionschema, it's great to finish this first.

✅ Change logo

✅ On the frontpage, add explanation above searchbar.

✅ Make the website showcase certain good example searches that I want it to be able to do. Click is search.

✅ Make the agents manually in `agent.actionschema.com` for now.

✅ Allow CORS anywhere from `openapi-util`

✅ Add a nice search submit animation with the logo

✅ Fix some problems in openapi-util

✅ Improve the openapi-util html page

# `getSemanticOpenapi` (August 3rd)

How do I make a good SDK with all this stuff?

- ✅ `getSemanticOpenapi` should still add definitions for components/schemas that are recursive.
- ✅ Maybe `getSemanticOpenapi` can actually not use dereferencing so we get a smaller file. Maybe this should be an option.
- ✅ Maybe `getSemanticOpenapi` can actually be renamed to THAT and return a JSON Schema. A bit more nested, but it's better that it's an openapi that is a JSON Schema in itself.
- 🎉 It took me a while but its working now, and it's returning a JSON Schema! :D Very useful actually that it can be used in $schema.

# `getSemanticOpenapiTypes`

- ✅ Fix: EUNMATCHEDRESOLVER = MissingPointerError (Token "definitions" does not exist.)
- ✅ Fix: Invalid value used as weak map key
- ✅ Look at resulting typescript file, and alter it so it gives just one over-arching type.
- ✅ 'Merged parameters and body' isn't nice. replace with best fitting description.

# Simplify client creator (august 3rd)

Remove from-anywhere and types dependency by putting it all in a separate 'sdk' folder, preferably in 1 file. **🤔 I think it's also interesting here to look at runtime import aggregation/resolving with `swc-util`, because otherwise we end up duplicating lots of code. I already had that working, should be very nice to throw that into the mix! 🍹**

- ✅ Remove `resolveSchemaRecursive` from getOperations
- ✅ Fully ditch `openapi-typescript`. **The conclusion is, we simplify before we go to the typescript realm, not after, so things happen at compile time rather than at inference.**
- ✅ Remove `qs.stringify`
- ✅ The client must consume a dereferenced openapi file, which can be created at `public/dereferenced.json` or so.
- ✅ Ultimately there should be an endpoint that takes in the openapi config and responds with 1 SDK file in typescript without imports. Can it be inferred from source? 👨‍🍳 😋
- ✅ `createClient` response should sync with SemanticOpenapi Schema
- ✅ Simplify `getOperationRequestInit` and expose it
- ✅ Expose SDK generation as an endpoint responding with a single file! Very interesting usecase because I need it everywhere and others may as well. **its a single file but not in a GET endpoint yet. could do it if needed**

# ActionSchema Spec (august 4th)

- ✅ Made huge progress for the spec! Implemented better `SemanticOpenapiSchema`, `SemanticOperationSchema`, `SemanticOperation`, and `ActionschemaPlugin`.
- ✅ Made the website show its docs including images, typescript, and links. Spent a bit too much time to make it look nice.
- ✅ Re-architected datastructures of CRUD, Auth for oauth2 compatibility (and better scoping as its main improvement)
- ✅ Created `login.js` script and added a starting point for `fork.js` to allow script injection on generated websites

# Vercel SDK (august 5th)

- ✅ Upgrade `actionschema-migrate`
- ✅ Try `eval`s Vercel SDK again.
- ✅ Make it work for recursive types
- 🤔 I don't think this is great yet. The resulting SDK's become huge, which is due to the fact we dereference so fast. We should dereference lazily... This would also create better types because definitions become types!
- ✅ Improved `pruneOpenapi` so it always gives a bundled doc but not dereferenced per se!

# Data SDK 🧪 (august 5th)

- ✅ Also remake SDK for data
- ✅ Fixed `pruneOpenapi` and ensure it gives a valid doc.
- ✅ Fix bug for data.actionschema.com/openapi.json --> Ensure generated SDK includes all CreateContext etc and we can easily use them in endpoints. This feature was useful. **maybe already resolved by not dereferencing!**
- ✅ Test http://localhost:3000/reference.html#/
- ✅ Ensure CRUD openapi is storing user-dependant models using `userId`
- ✅ Ensure `/authenticate` doesn't give `userAccessToken` but rather the `userId`
- ✅ Ensure everything is connected to userID rather than the access_token or authToken
- ✅ Created new database and created auth dbs using private admin key
- ❌ `ModelItem` should be renamed to the name of the Crud DB
- ❌ Before running `compile` in `generateTypescriptSdk`: merge all semantic openapis into one
- ✅ Decided i need multiple files (for now) and implemented it that way. SDK Code is now error free! 🎉

👨‍🍳 Learnings: JSONSchemas have multiple levels of referencing that we should be clear about, especially because fully dereferenced isn't possible because of recursive structures, and because remote references require async. Local references are sync and fast. its best to be clear about what level you're at. Also a proper validation of json/oas is well appreciated.

# August 19th, 2024

Removed all node dependencies and also turned `from-anywhere` into `edge-util` (without node). We can now use this at the edge!
