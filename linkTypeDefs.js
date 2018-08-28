module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
    }

    extend type Mutation {
        registerAccountWithProfile(email: String!, password: String!, userName: String!): AuthPayload
    }

`;


// module.exports = `
//     extend type User {
//         userProfile: Profile
//     }

//     extend type Profile {
//         user: User
//         // stories: [Story!]!
//     }

//     extend type Mutation {
//         register(email: String!, password: String!, userName: String!): User
//     }

// `;