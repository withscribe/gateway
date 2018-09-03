const { createApolloFetch } = require('apollo-fetch');
const { makeRemoteExecutableSchema, introspectSchema } = require('graphql-tools');

module.exports = {
    getIntrospectSchema: async (url) => {

        const serviceFetcher = createApolloFetch({ uri: url });
        const serviceSchema = await makeRemoteExecutableSchema({
            schema: await introspectSchema(serviceFetcher),
            fetcher: serviceFetcher,
        });

        serviceFetcher.use(function setHeaders({ options, request: { context } }, next) {
            if (context.graphqlContext.authorization == null) {
                return next();
            }

            if (options.headers == null) {
                options.headers = {};
            }

            options.headers.Authorization = `${context.graphqlContext.authorization}`;

            next();
        });

        return serviceSchema;
    }
}