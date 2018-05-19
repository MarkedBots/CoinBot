module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            required: true,
        },
        name: {
            type: DataTypes.STRING,
            required: true
        },
        role: {
            type: DataTypes.ENUM,
            values: ["user", "admin", "mod", "disabled"],
            defaultValue: "user"
        },
        balance: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_at:  DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        paranoid: true,
        underscored: true
    });

    return User;
};