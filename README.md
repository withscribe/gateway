# Scribe API Gateway
---
Scribe API Gateway is responsible for introspecting and merging (essentially aggregating) remote schemas into a single point of entry,
as well as delegating user requests to the appropriate schema.

# Dependencies
- apollo-engine
- apollo-fetch
- apollo-link-http
- apollo-server
- apollo-server-express,
- body-parser
- cors
- dotenv
- eslint
- express
- graphql
- graphql-tools
- jsonwebtoken

# Set Up Instructions (locally)
1. `npm install`
2. To run locally with nodemon
	- `npm test`

# Branches
 API Gateway repo follows this structure when creating branches. This will ensure a steady and safe flow from development -> production.

Prepended Name | Description | Branch From
--- | --- | ---
*feature/branchName* | Used for work that implements a new feature or addition. | Staging
*bug/branchName* | Used for work on fixing bugs | Staging
*hotfix/branchName* | Used for work fixing critical issues for production | Master
*release/branchName* | Used as a release candidate to production | Staging
*other/branchName* | Used for creating development branches (eg. Staging) | Staging


# Commit Structure
 When finished working on a branch, please commit and open a pull request to it's parents branch for code review.  
  
  **For Example:**  
  feature/NewFeature is completed. Commit changes and open pull request in staging branch for review

# Trello Boards
 Any TODO, bug, issue that still needs addressing can be found in the [Trello Boards](https://bitbucket.org/unraveldevops/unravel-api-gateway/addon/trello/trello-board).
 Record any work that has been completed or needs completing to the appropriate board.

# Environment Variables
 The gateway requires a `.env` file to be able to introspect the remote schemas.  Ask your administrator for the `.env` file to be able to run the gateway.
