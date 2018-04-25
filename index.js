
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 8081,
    cors = require('cors'),
    bodyParser = require('body-parser'),
    { graphqlExpress, graphiqlExpress } = require('apollo-server-express'),
    { mergeSchemas } = require('graphql-tools'),
    { getIntrospectSchema } = require('./introspection');

const authSchema = require('./schema');

const endpoints = [
    'http://localhost:3000/profile',
    'http://localhost:5000/story',
    // 'http://localhost:6000/auth'
];

(async function () {
    try {
        // promise to grab all remote schemas at the same time, we do not care in what order
        const allSchemas = await Promise.all(endpoints.map(ep => getIntrospectSchema(ep)));

        app.use(cors())

        // create function for /unravel endpoint and merge all schemas
        app.use('/unravel', bodyParser.json(), graphqlExpress({ schema: mergeSchemas({ schemas: allSchemas })}));

        app.use('/graphiql', graphiqlExpress({
            endpointURL: '/unravel',
        }));
        // start up /unravel endpoint for the main server/gateway
        app.listen(PORT, () => console.log('Unravel Gateway listening on port: ' + PORT));
    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();