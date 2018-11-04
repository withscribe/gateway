# Scribe API Gateway
---
Scribe API Gateway is responsible for introspecting and merging (essentially aggregating) remote schemas into a single point of entry,
as well as delegating user requests to the appropriate schema.

# Dependencies
- `apollo-engine`
- `apollo-fetch`
- `apollo-link-http`
- `apollo-server`
- `apollo-server-express`
- `body-parser`
- `cors`
- `dotenv`
- `eslint`
- `express`
- `graphql`
- `graphql-tools`
- `jsonwebtoken`

# Set up instructions (locally)
1. `npm install`
2. To run locally with nodemon
	- `npm test`  
      
   **Environment Variables**  
   The gateway requires a `.env` file to be able to introspect the remote schemas.  Ask your administrator for the `.env` file to be able to run the gateway.

# Branches
 API Gateway repo follows this structure when creating branches. This will ensure a steady and safe flow from development -> production.

Prepended Name | Description | Branch From
--- | --- | ---
`feature/branchName` | Used for work that implements a new feature or addition. | `other`
`bug/branchName` | Used for work on fixing bugs | `other`
`hotfix/branchName` | Used for work fixing critical issues for production | `master`
`release/branchName` | Used as a release candidate to production | `other`
`other/branchName` | Used for creating development branches (eg. development, staging...) | `master`


# Commit Structure
 When finished working on a branch, please commit and open a pull request to its parent branch for code review.  
  
  **For Example:**  
  feature/NewFeature is completed. Commit changes and open pull request in staging branch for review.

# Trello Boards
 Any TODO, bug, issue that still needs addressing can be found in the [Trello Boards](https://bitbucket.org/scribedevops/scribe-api-gateway/addon/trello/trello-board).
 Record any work that has been completed or needs completing to the appropriate board.
