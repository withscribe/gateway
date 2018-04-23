// var babel = require("babel-core").transform("code", options);
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} = require('graphql');

const { makeExecutableSchema } = require('graphql-tools');

const fetch = require('node-fetch');

const AUTH_BASE_URL = 'http://localhost:64162'
//const PROFILE_BASE_URL = 'http://localhost:3000'
// const AuthSchema = makeExecutableSchema({
//     typeDefs: `
//         type User {
//             id: ID!
//             username: String
//             email: String
//             password: String
//         }

//         type Query {
//             users: [User]
//         }
//     `
// });
const UserType = new GraphQLObjectType({
    name: 'User',
    description: '...',

    fields: () => ({
        username: {
            type: GraphQLString,
            resolve: (user) => user.username
        },

        email: {type: GraphQLString},
        id: {type: GraphQLInt}
    })
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
        users: {
           type: new GraphQLList(UserType),
        //    args: {
        //        id: {type: GraphQLString}
        //    },
           resolve: (root, args) => fetch(`${AUTH_BASE_URL}/api/v1/User`)
           .then(res => res.json())
           .then(json => json.users)

        },

        user: {
            type: UserType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (root, args) => fetch(`${AUTH_BASE_URL}/api/v1/User/${args.id}`)
            .then(res => res.json())
            .then(json => json)
        }
    })
})

module.exports = new GraphQLSchema({
    query: QueryType,
});