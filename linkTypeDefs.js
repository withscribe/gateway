module.exports = `
    extend type User {
        userProfile: Profile
    }

    extend type Profile {
        user: User
        stories: [Story!]!
    }

`;
