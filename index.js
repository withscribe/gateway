require('dotenv').config();
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8081,
    cors = require('cors'),
    { ApolloServer } = require('apollo-server-express'),
    { ApolloEngine } = require('apollo-engine'),
    { mergeSchemas } = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection'),
    linkResolvers = require('./resolvers/linkResolvers'),
    linkTypeDefs = require('./resolvers/linkTypeDefs');


const storyEp = 'http://localhost:4000/story'
const profileEp = 'http://localhost:3000/profile';
const authEp = 'http://localhost:5000/auth';
const path = '/unravel';

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
                    stories: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve(parent, args, context, info) {
                            return info.mergeInfo.delegate(
                                'query',
                                'storiesByProfileId',
                                {
                                    profileId: parent.id
                                },
                                context,
                                info
                            )
                        }
            
                    }
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
                            console.log(account)
            
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
            
                            console.log(profile)
            
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
            }),
        });

        const server = new ApolloServer({
            schema: mergedSchema,
            //resolvers: linkResolvers,
            // tracing: true,
            // cacheControl: true,
            // // We set `engine` to false, so that the new agent is not used.
            // engine: false,
            context: ({req, res}) => {
                return {authorization: req.headers['authorization']};
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
        app.listen(PORT, () => console.log(`Unravel Gateway listening on port: ${PORT}`));
          
    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();