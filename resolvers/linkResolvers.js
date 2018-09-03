const resolvers = ({
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
});

module.exports = {
    resolvers
}