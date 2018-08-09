
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8081,
    cors = require('cors'),
    bodyParser  = require('body-parser'),
    { graphqlExpress, graphiqlExpress } = require('apollo-server-express'),
    { mergeSchemas} = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection');

const linkTypeDefs = require('./linkTypeDefs');

const storyEp = 'http://localhost:4000/story'
const profileEp = 'http://localhost:3000/profile';
const authEp = 'http://localhost:5000/auth';


(async function () {
    try {
        
        const profileSchema = await getIntrospectSchema(profileEp);
        const authSchema = await getIntrospectSchema(authEp);
        const storySchema = await getIntrospectSchema(storyEp);

        app.use(cors())

        // create function for /unravel endpoint and merge all schemas
        app.use('/unravel', bodyParser.json(), graphqlExpress({ schema: mergeSchemas({ 
            schemas: [
                storySchema,
                profileSchema,
                authSchema,
                linkTypeDefs
            ], 
            resolvers: mergeInfo => ({
                User: {
                    userProfile: {
                        fragment: `fragment UserFragment on User { id }`,
                        resolve(parent, args, context, info) {
                            return info.mergeInfo.delegate(
                                'query',
                                'findProfileByUserId',
                                {
                                    user_id: parent.id
                                },
                                context,
                                info
                            );
                        },
                    },
                },
                Profile: {
                    user: {
                        fragment: `fragment ProfileFragment on Profile { id }`,
                        resolve(parent, args, context, info) {
                            return info.mergeInfo.delegate(
                                'query',
                                'findUserByProfileId',
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