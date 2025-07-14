-- ================================================================
-- EDC Production Database Schema
-- Electronic Data Capture System - Complete SQL Setup
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- USERS & AUTHENTICATION
-- ================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'super_admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ================================================================
-- PROJECTS & ASSIGNMENTS
-- ================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    settings JSONB DEFAULT '{}',
    project_metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_projects (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, project_id)
);

-- ================================================================
-- UNIFIED FORMS SYSTEM
-- ================================================================

CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN (
        'volunteer_medical_screening', 'pregnancy_tests', 'laboratory_reports', 
        'study_period', 'post_study', 'custom'
    )),
    title VARCHAR(255) NOT NULL,
    version INTEGER DEFAULT 1,
    case_id VARCHAR(100),
    volunteer_id VARCHAR(100),
    study_number VARCHAR(100),
    period_number VARCHAR(50),
    form_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'locked')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    review_comments TEXT,
    project_id UUID REFERENCES projects(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- COMPREHENSIVE AUDIT SYSTEM
-- ================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    field_changes JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    form_id UUID REFERENCES forms(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Project indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Form indexes
CREATE INDEX idx_forms_type ON forms(form_type);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_case_id ON forms(case_id);
CREATE INDEX idx_forms_volunteer_id ON forms(volunteer_id);
CREATE INDEX idx_forms_project_id ON forms(project_id);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_submitted_at ON forms(submitted_at);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_form_id ON audit_logs(form_id);

-- ================================================================
-- SEED DATA - TEST USERS
-- ================================================================

-- Insert test users with bcrypt hashed passwords
-- Passwords: SuperAdmin123!, Admin123!, Employee123!
INSERT INTO users (email, hashed_password, first_name, last_name, role, status) VALUES
('superadmin@edc.com', '$2b$12$LXtJGWzDNX8mZvwX.WJ8LeXKlN5VYYwc1WV5eV0Zq1YvWnvQvK.P2', 'Super', 'Admin', 'super_admin', 'active'),
('admin@edc.com', '$2b$12$6XKQtWYrGvX3bJL8QH0wD.VnM9vZ9d7.c8bQtN5QLZX7vWF8N4L.e', 'Admin', 'User', 'admin', 'active'),
('employee@edc.com', '$2b$12$QSfC3ZJK8b4X5v7N2M1T9.WzGvX9c6b4Y8rN5d3WLXF7vK9Q2J.s', 'Employee', 'User', 'employee', 'active');

-- ================================================================
-- VIEWS FOR REPORTING
-- ================================================================

CREATE OR REPLACE VIEW form_summary AS
SELECT 
    f.id,
    f.form_type,
    f.title,
    f.status,
    f.case_id,
    f.volunteer_id,
    f.study_number,
    f.created_at,
    f.submitted_at,
    u.email as created_by_email,
    CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
    p.name as project_name
FROM forms f
LEFT JOIN users u ON f.created_by = u.id
LEFT JOIN projects p ON f.project_id = p.id;

CREATE OR REPLACE VIEW audit_summary AS
SELECT 
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.created_at,
    u.email as user_email,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    u.role as user_role
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- ================================================================
-- FUNCTIONS FOR SECURITY & AUDIT
-- ================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ================================================================

-- Sample project
INSERT INTO projects (name, description, status, created_by) VALUES 
('Clinical Trial Study 001', 'Phase II clinical trial for new medication', 'active', 
 (SELECT id FROM users WHERE email = 'admin@edc.com'));

-- Assign employee to project
INSERT INTO user_projects (user_id, project_id, assigned_by) VALUES 
((SELECT id FROM users WHERE email = 'employee@edc.com'),
 (SELECT id FROM projects WHERE name = 'Clinical Trial Study 001'),
 (SELECT id FROM users WHERE email = 'admin@edc.com'));

-- Sample form
INSERT INTO forms (form_type, title, case_id, volunteer_id, study_number, form_data, project_id, created_by) VALUES 
('volunteer_medical_screening', 'Initial Medical Screening', 'CASE-001', 'VOL-001', 'STUDY-001', 
 '{"screening_date": "2024-01-15", "medical_history": {"allergies": "None", "medications": "None"}}',
 (SELECT id FROM projects WHERE name = 'Clinical Trial Study 001'),
 (SELECT id FROM users WHERE email = 'employee@edc.com'));

-- ================================================================
-- SECURITY NOTES
-- ================================================================

/*
Security Features Implemented:
1. UUID primary keys for all tables
2. Role-based access control with enum constraints
3. Password hashing (bcrypt with 12 rounds)
4. Comprehensive audit logging
5. Foreign key constraints for data integrity
6. Check constraints for valid enum values
7. Indexes for performance optimization
8. Automatic timestamp management

Production Deployment Checklist:
1. Change default passwords for test users
2. Set up SSL/TLS certificates
3. Configure firewall rules
4. Set up database backups
5. Configure monitoring and alerting
6. Review and restrict database permissions
7. Enable database connection encryption
8. Set up log rotation for audit logs
9. Configure rate limiting at application level
10. Regular security updates and patches
*/