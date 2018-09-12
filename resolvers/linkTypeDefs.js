module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
    }

    extend type Mutation {
        registerAccountWithProfile(email: String!, password: String!, userName: String!): AuthPayload
        updateProfileWithAccount(accountId: ID!, email: String, userName: String!, firstName: String, lastName: String, dob: String, occupation: String): Profile

    }
`;

