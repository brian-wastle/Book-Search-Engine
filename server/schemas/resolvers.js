const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // me: async (parent, args, context) => {
    //   if (context.user) {
    //     const userData = await User.findOne({ _id: context.user._id })
    //     return userData;
    //   }
    // },
    me: async (parent, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  },
  

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { id, input }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw AuthenticationError;
    },
    removeBook: async (parent, { id, bookId }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "Couldn't find user with this id!" });
      }
      return updatedUser;
    },
  },
};


module.exports = resolvers;
