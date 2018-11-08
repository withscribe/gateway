require('dotenv').config();
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8082,
    cors = require('cors'),
    { ApolloServer } = require('apollo-server-express'),
    { ApolloEngine  } = require('apollo-engine'),
    { mergeSchemas } = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection'),
    linkTypeDefs = require('./resolvers/linkTypeDefs');


const storyEp = `${process.env.STORY_EP}`
const profileEp = `${process.env.PROFILE_EP}`;
const authEp = `${process.env.AUTH_EP}`;
const communityEp = `${process.env.COMMUNITY_EP}`;
const path = `/${process.env.GATEWAY_PATH}`;

(async function () {
    try {

        const profileSchema = await getIntrospectSchema(profileEp);
        const storySchema = await getIntrospectSchema(storyEp);
        const authSchema = await getIntrospectSchema(authEp);
        const communitySchema = await getIntrospectSchema(communityEp);

        app.use(cors())

        const mergedSchema = mergeSchemas({
            schemas: [
                storySchema,
                profileSchema,
                authSchema,
                communitySchema,
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
                            return await info.mergeInfo.delegateToSchema({
                                schema: authSchema,
                                operation: 'query',
                                fieldName: 'accountByProfileId',
                                args: {
                                    profileId: parent.id
                                },
                                context,
                                info
                            })
                        }
                    },
                    originalStories: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'query',
                                fieldName: 'storiesByAuthorId',
                                args: {
                                    authorId: parent.id
                                },
                                context,
                                info
                            })
                        }
                    },
                    nonOriginalStories: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'query',
                                fieldName: 'storiesByNonAuthorId',
                                args: {
                                    nonAuthorId: parent.id
                                },
                                context,
                                info
                            })
                        }
                    },
                    communities: {
                        fragment: `fragment ProfileFragment on Profile { communitiesIds }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: communitySchema,
                                operation: 'query',
                                fieldName: 'membersCommunities',
                                args: {
                                    communitiesIds: parent.communitiesIds
                                },
                                context,
                                info
                            })
                        }
                    }
                },
                Story: {
                    authorProfile: {
                        fragment: `fragment AuthorFragment on Story { authorId }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'query',
                                fieldName: 'profileById',
                                args: {
                                    id: parent.authorId
                                },
                                context,
                                info
                            })
                        }
                    },
                    nonAuthorProfile: {
                        fragment: `fragment NonAuthorFragment on Story { nonAuthorId }`,
                        resolve: async (parent, obj, context, info) => {
                            if (parent.nonAuthorId) {
                                return await info.mergeInfo.delegateToSchema({
                                    schema: profileSchema,
                                    operation: 'query',
                                    fieldName: 'profileById',
                                    args: {
                                        id: parent.nonAuthorId
                                    },
                                    context,
                                    info
                                })
                            }
                            return {}
                        }
                    },
                },
                Community: {
                    stories: {
                        fragment: `fragment CommunityStories on Community { id }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'query',
                                fieldName: 'storiesByCommunityId',
                                args: {
                                    communityId: parent.id
                                },
                                context,
                                info
                            })
                        }
                    },
                    members: {
                        fragment: `fragment CommunityMembers on Community { membersIds }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'query',
                                fieldName: 'communitiesMembers',
                                args: {
                                    membersIds: parent.membersIds
                                },
                                context,
                                info
                            })
                        }
                    },
                    bannedMembers: {
                        fragment: `fragment CommunityBannedMembers on Community { bannedMembersIds }`,
                        resolve: async (parent, obj, context, info) => {
                            return await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'query',
                                fieldName: 'communitiesMembers',
                                args: {
                                    membersIds: parent.bannedMembersIds
                                },
                                context,
                                info
                            })
                        }
                    },
                },
                Mutation: {
                    register: {
                        fragment: `fragment RegisterFragment on Account { id }`,
                        resolve: async (parents, obj, context, info) => {

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

                            if (userNameExists != null) {
                                throw new Error("Username has already been taken")
                            } else {
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
                                // THIS IS STILL BROKEN ----
                                // NOTE: PROTECT ROUTE AND PASS TOKEN IN CONTEXT TO AUTHORIZE
                                const accountAttached = await info.mergeInfo.delegateToSchema({
                                    schema: authSchema,
                                    operation: 'mutation',
                                    fieldName: 'attachProfileToAccount',
                                    args: {
                                        accountId: account.id,
                                        profileId: profile.id
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
                        }
                    },
                    updateProfileWithAccount: {
                        fragment: `fragment TestFragment on Profile { id }`,
                        resolve: async (parent, obj, context, info) => {
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
                    },
                    like: {
                        fragment: `fragment LikeStoryFragment on Story { id }`,
                        resolve: async (parent, obj, context, info) => {

                            const profile = await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'mutation',
                                fieldName: 'addLikedStory',
                                args: {
                                    storyId: obj.storyId
                                },
                                context,
                                info
                            })

                            const story = await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'mutation',
                                fieldName: 'addLikeToStory',
                                args: {
                                    storyId: obj.storyId,
                                    profileId: profile.id
                                },
                                context,
                                info
                            })
                            return story
                        }
                    },
                    removeLike: {
                        fragment: `fragment RemoveLikeFragment on Story { id }`,
                        resolve: async (parent, obj, context, info) => {
                            const story = await info.mergeInfo.delegateToSchema({
                                schema: storySchema,
                                operation: 'mutation',
                                fieldName: 'removeLikeFromStory',
                                args: {
                                    storyId: obj.storyId
                                },
                                context,
                                info
                            })

                            const profile = info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'mutation',
                                fieldName: 'removeLikedStory',
                                args: {
                                    storyId: obj.storyId
                                },
                                context,
                                info
                            })                       
                            return story
                        }
                    },
                    addMemberToCommunity: {
                        fragment: `fragment CommunityAddMember on Community { id }`,
                        resolve: async (parent, obj, context, info) => {
                            const profile = await info.mergeInfo.delegateToSchema({
                                schema: profileSchema,
                                operation: 'mutation',
                                fieldName: 'setCommunityToProfile',
                                args: {
                                    id: obj.profileId,
                                    communityId: obj.communityId
                                },
                                context,
                                info
                            })

                            return await info.mergeInfo.delegateToSchema({
                                schema: communitySchema,
                                operation: 'mutation',
                                fieldName: 'setMemberToCommunity',
                                args: {
                                    id: obj.communityId,
                                    profileId: obj.profileId
                                },
                                context,
                                info
                            })
                        }
                    },
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
            context: ({ req, res }) => {
                return {
                    authorization: req.headers['authorization']
                };
            },
        })

        server.applyMiddleware({ app, path })

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
        app.listen(PORT, () => console.log(`Gateway listening on port: ${PORT}`));

    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();