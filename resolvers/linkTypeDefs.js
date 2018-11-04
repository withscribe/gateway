module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
        originalStories: [Story!]!
        nonOriginalStories: [Story!]!
    }

    extend type Story {
        authorProfile: Profile
        nonAuthorProfile: Profile 
    }

    extend type Mutation {
        updateProfileWithAccount(email: String, userName: String, firstName: String, lastName: String, dob: String, occupation: String): Profile
        register(email: String!, password: String!, userName: String!): AuthPayload
        like(storyId: ID): Story
        removeLike(storyId: ID): Story
    }
`;
