
// NOT USING -- NOT WORKING NEED TO FIGURE OUT HOW TO IMPORT THIS FILE INSTEAD OF HAVING
// RESOLVERS IN THE INDEX.JS

// const resolvers = ({
//     Account: {
//         profile: {
//             fragment: `fragment AccountFragment on Account { id }`,
//             resolve(parent, args, context, info) {
//                 return info.mergeInfo.delegate(
//                     'query',
//                     'profileByAccountId',
//                     {
//                         accountId: parent.id
//                     },
//                     context,
//                     info

//                 )
//             },
//         },
//     },
//     Profile: {
//         account: {
//             fragment: `fragment ProfileFragment on Profile { id }`,
//             resolve(parent, args, context, info) {
//                 //console.log(parent.id)
//                 return info.mergeInfo.delegateToSchema(
//                     'query',
//                     'accountByProfileId',
//                     {
//                         profileID: parent.id
//                     },
//                     context,
//                     info

//                 )
//             }
//         },
//         stories: {
//             fragment: `fragment ProfileFragment on Profile { id }`,
//             resolve(parent, args, context, info) {
//                 return info.mergeInfo.delegate(
//                     'query',
//                     'storiesByProfileId',
//                     {
//                         profileId: parent.id
//                     },
//                     context,
//                     info
//                 )
//             }

//         }
//     },
//     Mutation: {
//        registerAccountWithProfile: {
//             fragment: `fragment RegisterFragment on Account { id }`,
//             resolve:  (parent, args, context, info) => {

//                 const accountExists = info.mergeInfo.delegate(
//                     'query',
//                     'searchByEmail',
//                     {
//                         email: args.email
//                     },
//                     context,
//                     info
//                 )

//                 const userNameExists = info.mergeInfo.delegate(
//                     'query',
//                     'profileByUsername',
//                     {
//                         userName: args.userName
//                     },
//                     context,
//                     info
//                 )
//                 console.log(userNameExists)
//                 console.log(accountExists)
//                 if(accountExists) {
//                     throw new Error("Email is already registered")
//                 }
//                 else if(userNameExists) {
//                     throw new Error("Username has already been taken")
//                 } else {
//                     // register the user
//                     const { account, token, refreshToken } =  info.mergeInfo.delegate(
//                         'mutation',
//                         'register',
//                         {
//                             email: args.email,
//                             password: args.password,
    
//                         },
//                         context,
//                         info
//                     )
//                     console.log(account)
    
//                     // register the user profile to the newly created account
//                     const profile =  info.mergeInfo.delegate(
//                         'mutation',
//                         'registerProfile',
//                         {
//                             accountId: account.id,
//                             userName: args.userName
//                         },
//                         context,
//                         info
    
//                     )
    
//                     console.log(profile)
    
//                     // attach the profile to the new user account
//                     info.mergeInfo.delegate(
//                         'mutation',
//                         'setProfileToAccount',
//                         {
//                             accountId: account.id,
//                             profileID: profile.id
//                         },
//                         context,
//                         info
//                     )

//                     return {
//                         token,
//                         refreshToken,
//                         account
//                     }
//                 }

//             }
//        },
//        updateProfileWithAccount: {
//             fragment: `fragment UpdateFragment on Account { id }`,
//             resolve: async (parent, args, context, info) => {
//                 console.log('You are here')
//                 const account = await info.mergeInfo.delegate(
//                     'mutation',
//                     'updateAccount',
//                     {
//                         accountId: args.accountId,
//                         email: args.email
//                     },
//                     context,
//                     info
//                 )

//                 console.log(account)


//                 const profile = await info.mergeInfo.delegate(
//                     'mutation',
//                     'updateProfileCreate',
//                     {
//                         firstName: args.firstName,
//                         lastName: args.lastName,
//                         dob: args.dob,
//                         occupation: args.occupation
//                     },
//                     context,
//                     info
//                 )

//                 console.log(profile)

//                 return {
//                     profile
//                 }
//             }
//         }   
//     }
// });

// module.exports = {
//     resolvers
// }