const bcrypt = require('bcrypt');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../utils/auditLogger');

/**
 * LOGIN
 * - super_admin: email + password ONLY
 * - tenant_admin / user: email + password + tenantSubdomain
 */
async function login(req, res) {
    try {
        const { email, password, tenantSubdomain } = req.body;

        // 1️⃣ Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // 2️⃣ Find user by email (no tenant join yet)
        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = userResult.rows[0];

        // 3️⃣ Verify password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 4️⃣ SUPER ADMIN LOGIN (NO TENANT)
        if (user.role === 'super_admin') {
            const token = generateToken({
                userId: user.id,
                tenantId: null,
                role: user.role
            });

            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role
                    },
                    token
                }
            });
        }

        // 5️⃣ Tenant users MUST provide tenantSubdomain
        if (!tenantSubdomain) {
            return res.status(400).json({
                success: false,
                message: 'tenantSubdomain is required'
            });
        }

        // 6️⃣ Validate user belongs to tenant
        const tenantUserResult = await db.query(
            `
            SELECT
                u.id,
                u.email,
                u.full_name,
                u.role,
                u.tenant_id,
                t.subdomain
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1 AND t.subdomain = $2
            `,
            [user.id, tenantSubdomain]
        );

        if (tenantUserResult.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'User does not belong to this tenant'
            });
        }

        const tenantUser = tenantUserResult.rows[0];

        // 7️⃣ Generate JWT for tenant user
        const token = generateToken({
            userId: tenantUser.id,
            tenantId: tenantUser.tenant_id,
            role: tenantUser.role
        });

        // 8️⃣ Audit log
        await logAudit({
            tenantId: tenantUser.tenant_id,
            userId: tenantUser.id,
            action: 'LOGIN',
            entityType: 'auth',
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: tenantUser.id,
                    email: tenantUser.email,
                    fullName: tenantUser.full_name,
                    role: tenantUser.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * GET CURRENT USER
 */
async function getCurrentUser(req, res) {
    try {
        const { userId } = req.user;

        const result = await db.query(
            `
            SELECT
                u.id,
                u.email,
                u.full_name,
                u.role,
                u.is_active,
                t.id AS tenant_id,
                t.name AS tenant_name,
                t.subdomain,
                t.subscription_plan,
                t.max_users,
                t.max_projects
            FROM users u
            LEFT JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1
            `,
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const row = result.rows[0];

        return res.status(200).json({
            success: true,
            data: {
                id: row.id,
                email: row.email,
                fullName: row.full_name,
                role: row.role,
                isActive: row.is_active,
                tenant: row.tenant_id
                    ? {
                        id: row.tenant_id,
                        name: row.tenant_name,
                        subdomain: row.subdomain,
                        subscriptionPlan: row.subscription_plan,
                        maxUsers: row.max_users,
                        maxProjects: row.max_projects
                    }
                    : null
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * LOGOUT
 */
async function logout(req, res) {
    try {
        const { userId, tenantId } = req.user;

        await logAudit({
            tenantId,
            userId,
            action: 'LOGOUT',
            entityType: 'auth',
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    login,
    getCurrentUser,
    logout
};
