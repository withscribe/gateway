
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8081,
    cors = require('cors'),
    bodyParser  = require('body-parser'),
    { graphqlExpress, graphiqlExpress } = require('apollo-server-express'),
    { mergeSchemas, delegateToSchema } = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection')

const linkTypeDefs = require('./linkTypeDefs');

//const storyEp = 'http://localhost:4000/story'
const profileEp = 'http://localhost:3000/profile';
const authEp = 'http://localhost:5000/auth';


(async function () {
    try {
        
        const profileSchema = await getIntrospectSchema(profileEp);
        const authSchema = await getIntrospectSchema(authEp);
        //const storySchema = await getIntrospectSchema(storyEp);

        app.use(cors())

        // create function for /unravel endpoint and merge all schemas
        app.use('/unravel', bodyParser.json(), graphqlExpress({ schema: mergeSchemas({ 
            schemas: [
                //storySchema,
                profileSchema,
                authSchema,
                linkTypeDefs
            ], 
            resolvers: mergeInfo => ({
                Account: {
                    profile: {
                        fragment: `fragment AccountFragment on Account { id }`,
                        resolve(parent, args, context, info) {
                            return info.mergeInfo.delegate(
                                'query',
                                'profileByAccountId',
                                {
                                    accountId: parent.id
                                },
                                context,
                                info

                            )
                        },
                    },
                },
                Profile: {
                    account: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve(parent, args, context, info) {
                            return info.mergeInfo.delegate(
                                'query',
                                'accountByProfileId',
                                {
                                    profileID: parent.id
                                },
                                context,
                                info

                            )
                        }
                    },
                    // stories: {
                    //     fragment: `fragment ProfileFragment on Profile { id }`,
                    //     resolve(parent, args, context, info) {
                    //         return info.mergeInfo.delegate(
                    //             'query',
                    //             'storiesByProfileId',
                    //             {
                    //                 profileId: parent.id
                    //             },
                    //             context,
                    //             info
                    //         )
                    //     }

                    // }
                },
                Mutation: {
                   registerAccountWithProfile: {
                    fragment: `fragment RegisterFragment on Account { id }`,
                    resolve: async (parent, args, context, info) => {

                            // register the user
                            const { account, token, refreshToken } = await info.mergeInfo.delegate(
                                'mutation',
                                'register',
                                {
                                    email: args.email,
                                    password: args.password,
   
                                },
                                context,
                                info
                            )

                            // register the user profile to the newly created account
                            const profile = await info.mergeInfo.delegate(
                                'mutation',
                                'registerProfile',
                                {
                                    accountId: account.id,
                                    userName: args.userName
                                },
                                context,
                                info

                            )

                            // attach the profile to the new user account
                            info.mergeInfo.delegate(
                                'mutation',
                                'setProfileToAccount',
                                {
                                    accountId: account.id,
                                    profileID: profile.id
                                },
                                context,
                                info
                            )

                        return {
                            token,
                            refreshToken,
                            account
                        }
                    }

                   },
                }
            })
        })
    })
);
        app.use('/graphiql', graphiqlExpress({
            endpointURL: '/unravel',
        }));
        // start up /unravel endpoint for the main server/gateway
        app.listen(PORT, () => console.log('Unravel Gateway listening on port: ' + PORT));
    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();