module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
    }

    extend type Mutation {
        registerAccountWithProfile(email: String!, password: String!, userName: String!): AuthPayload
        updateProfileWithAccount(email: String, userName: String, firstName: String, lastName: String, dob: String, occupation: String): Profile
        submitStoryAndAddToProfile(profileId: ID!, title: String!, description: String!, content: String!): Story
    }
`;
