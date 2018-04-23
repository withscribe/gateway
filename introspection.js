const fetch = require('node-fetch');
const { makeRemoteExecutableSchema, introspectSchema } = require('graphql-tools');
const { createHttpLink } = require('apollo-link-http');

module.exports = {
    getIntrospectSchema: async (url) => {
        // Create a link to a GraphQL instance by passing fetch instance and url
        const makeDataBaseServiceLink = () => createHttpLink({
            uri: url,
            fetch
        });

        // Fetch our schema
        const databaseServiceSchemaDefinition = await introspectSchema(makeDataBaseServiceLink());

        // Make an executable schema
        return makeRemoteExecutableSchema({
            schema: databaseServiceSchemaDefinition,
            link: makeDataBaseServiceLink()
        });
    }
}