// Author: Austin Howlett
// Description: Responsible for extending the remote schemas, this allows for building relations
// between remote schema types and also allows for queries/mutations to be delegated to multiple remote schemas

module.exports = `
    extend type Account {
        profile: Profile
    }

    extend type Profile {
        account: Account
        originalStories: [Story!]!
        nonOriginalStories: [Story!]!
        communities: [Community!]!
    }

    extend type Story {
        authorProfile: Profile
        nonAuthorProfile: Profile
    }

    extend type Community {
        stories: [Story!]!
        members: [Profile!]!
        bannedMembers: [Profile!]!
    }

    extend type Mutation {
        updateProfileWithAccount(email: String, userName: String, firstName: String, lastName: String, dob: String, occupation: String): Profile
        register(email: String!, password: String!, userName: String!): AuthPayload
        like(storyId: ID): Story
        removeLike(storyId: ID, profileId: ID,): Story
        addMember(profileId: ID!, communityId: ID!): Community
        removeMember(profileId: ID!, communityId: ID!): Community
        addStoryToCommunity(storyId: ID!, communityId: ID!): Community
        removeStoryFromCommunity(storyId: ID!, communityId: ID!): Community
        submitStory(title: String!, description: String!, author: String!, content: String!, authorId: ID, communityId: ID): Story
    }
`;
