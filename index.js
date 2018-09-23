require('dotenv').config();
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8082,
    cors = require('cors'),
    { ApolloServer } = require('apollo-server-express'),
    { ApolloEngine  } = require('apollo-engine'),
    { mergeSchemas } = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection'),
    linkResolvers = require('./resolvers/linkResolvers'),
    linkTypeDefs = require('./resolvers/linkTypeDefs');


const storyEp = `${process.env.STORY_EP}`
const profileEp = `${process.env.PROFILE_EP}`;
const authEp = `${process.env.AUTH_EP}`;
const path = `/${process.env.GATEWAY_PATH}`;

(async function () {
    try {

        const profileSchema = await getIntrospectSchema(profileEp);
        const storySchema = await getIntrospectSchema(storyEp);
        const authSchema = await getIntrospectSchema(authEp);

        app.use(cors())

        const mergedSchema = mergeSchemas({
            schemas: [
                storySchema,
                profileSchema,
                authSchema,
                linkTypeDefs
            ],
            resolvers: ({
                Account: {
                    profile: {
                        fragment: `fragment AccountFragment on Account { id }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'query',
                                fieldName: 'profileByAccountId',
                                args: {
                                    accountId: parent.id
                                },
                                context,
                                info

                            })
                        },
                    },
                },
                Profile: {
                    account: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
                            console.log("Profile: parentid: " + parent.id)
                            return await info.mergeInfo.delegateToSchema({
                                schema: authSchema,
                                operation: 'query',
                                fieldName: 'accountByProfileId',
                                args: {
                                    profileID: parent.id
                                },
                                context,
                                info
                            })
                        }
                    },
                    profileStories: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'query',
                                fieldName: 'storiesByProfileId',
                                args: {
                                    profileId: parent.id
                                },
                                context,
                                info
                            })
                        }

                    }
                },
                Mutation: {
                    register: {
                        fragment: `fragment RegisterFragment on Account { id }`,
                        resolve: async (parents, obj, context, info) => {

                            const { account, token, refreshToken} = await info.mergeInfo.delegateToSchema({
                                schema: authSchema,
                                operation: 'mutation',
                                fieldName: 'registerAccount',
                                args: {
                                    email: obj.email,
                                    password: obj.password,
                                },
                                context,
                                info
                            })

                            // register the user profile to the newly created account
                            const profile = await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'mutation',
                                fieldName: 'registerProfile',
                                args: {
                                    accountId: account.id,
                                    userName: obj.userName
                                },
                                context,
                                info
                            })

                            // attach the profile to the new user account
                            const accountAttached = await info.mergeInfo.delegateToSchema({
                                schema: authSchema,
                                operation: 'mutation',
                                fieldName: 'attachProfileToAccount',
                                args: {
                                    accountId: account.id,
                                    profileID: profile.id
                                },
                                context,
                                info
                            })

                            return {
                                token,
                                refreshToken,
                                account
                            }
                        }
                    },
                    updateProfileWithAccount: {
                        fragment: `fragment TestFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
                            if (obj.userName != null) {
                                const userNameExists = await info.mergeInfo.delegateToSchema({
                                    schema: profileSchema,
                                    operation: 'query',
                                    fieldName: 'userNameExists',
                                    args: {
                                        userName: obj.userName
                                    },
                                    context,
                                    info
                                })

                                if (userNameExists.length != 0) {
                                    throw new Error("Username has already been taken")
                                } else {

                                    if (obj.email != null) {

                                        const account = await info.mergeInfo.delegateToSchema({
                                            schema: authSchema,
                                            operation: 'mutation',
                                            fieldName: 'updateAccountCreate',
                                            args: {
                                                email: obj.email
                                            },
                                            context,
                                            info

                                        })
                                    }

                                    const profile = await info.mergeInfo.delegateToSchema({
                                        schema: profileSchema,
                                        operation: 'mutation',
                                        fieldName: 'updateProfileCreate',
                                        args: {
                                            firstName: obj.firstName,
                                            lastName: obj.lastName,
                                            userName: obj.userName,
                                            dob: obj.dob,
                                            occupation: obj.occupation
                                        },
                                        context,
                                        info
                                    })
                                    return profile

                                }
                            } else {

                                const account = await info.mergeInfo.delegateToSchema({
                                    schema: authSchema,
                                    operation: 'mutation',
                                    fieldName: 'updateAccountCreate',
                                    args: {
                                        email: obj.email
                                    },
                                    context,
                                    info

                                })

                                const profile = await info.mergeInfo.delegateToSchema({
                                    schema: profileSchema,
                                    operation: 'mutation',
                                    fieldName: 'updateProfileCreate',
                                    args: {
                                        firstName: obj.firstName,
                                        lastName: obj.lastName,
                                        userName: obj.userName,
                                        dob: obj.dob,
                                        occupation: obj.occupation
                                    },
                                    context,
                                    info
                                })

                                return profile
                            }
                        }
                    }
                }
            }),
        });

        const server = new ApolloServer({
            schema: mergedSchema,
            playground: {
                settings: {
                    'editor.cursorShape': 'line'
                }
            },
            // tracing: true,
            // cacheControl: true,
            // // We set `engine` to false, so that the new agent is not used.
            // engine: false,
            context: ({
                req,
                res
            }) => {
                return {
                    authorization: req.headers['authorization']
                };
            },
        })

        server.applyMiddleware({
            app,
            path
        })

        // **** APOLLO ENGINE NOT CONFIGURED PROPERLY YET ****

        // const engine = new ApolloEngine({
        //     apiKey: process.env.ENGINE_API_KEY
        // });

        // engine.listen({
        //     port: PORT,
        //     graphqlPaths: ['/unravel'],
        //     expressApp: app,
        //     launcherOptions: {
        //       startupTimeout: 3000,
        //     },
        //   }, () => {
        //     console.log(`Unravel Gateway listening on port: ${PORT}`);
        //   });

        // **** APOLLO ENGINE END ****

        // start up /unravel endpoint for the main server/gateway
        app.listen(PORT, () => console.log(`Unravel Gateway listening on port: ${PORT}`));

    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();