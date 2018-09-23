module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
        profileStories: [Story!]!
    }

    extend type Mutation {
        updateProfileWithAccount(email: String, userName: String, firstName: String, lastName: String, dob: String, occupation: String): Profile
        register(email: String!, password: String!, userName: String!): AuthPayload
    }
`;
