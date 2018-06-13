module.exports = (database) => {
    let permissions = {};

    permissions.check = (userId, requiredRole) => {
        database.users.findById(userId).then(user => {
            return user.role == requiredRole.toLowerCase();
        });
    }

    return permissions;
}
