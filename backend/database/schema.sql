-- Ente KSRTC Enterprise Transportation Management System (V2)

-- 1. AUTHENTICATION & PERMISSIONS
CREATE TABLE permissions (
    permission_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_permission_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    depot_id BIGINT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    profile_image VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
    -- FOREIGN KEY (depot_id) REFERENCES depots(depot_id) is added via ALTER TABLE below
);

-- 2. DEPOTS (Operations)
CREATE TABLE depots (
    depot_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    depot_code VARCHAR(20) UNIQUE NOT NULL,
    depot_name VARCHAR(100) NOT NULL,
    address TEXT,
    district VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    manager_id BIGINT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fix circular dependency
ALTER TABLE depots
ADD CONSTRAINT fk_depot_manager
FOREIGN KEY(manager_id) REFERENCES users(user_id);

ALTER TABLE users
ADD CONSTRAINT fk_user_depot
FOREIGN KEY(depot_id) REFERENCES depots(depot_id);

-- 3. FLEET MANAGEMENT
CREATE TABLE bus_types (
    bus_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    fare_multiplier DECIMAL(4,2) DEFAULT 1.00,
    has_ac BOOLEAN DEFAULT FALSE,
    is_sleeper BOOLEAN DEFAULT FALSE
);

CREATE TABLE bus_layouts (
    layout_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    layout_name VARCHAR(50) NOT NULL,
    rows INT NOT NULL,
    columns INT NOT NULL
);

CREATE TABLE bus_layout_seats (
    layout_seat_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    layout_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    row_no INT NOT NULL,
    column_no INT NOT NULL,
    seat_type VARCHAR(20),
    is_window BOOLEAN DEFAULT FALSE,
    is_ladies_reserved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (layout_id) REFERENCES bus_layouts(layout_id),
    UNIQUE(layout_id, seat_number)
);

CREATE TABLE buses (
    bus_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    depot_id BIGINT,
    bus_type_id BIGINT,
    capacity INT NOT NULL,
    layout_id BIGINT,
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (depot_id) REFERENCES depots(depot_id),
    FOREIGN KEY (bus_type_id) REFERENCES bus_types(bus_type_id),
    FOREIGN KEY (layout_id) REFERENCES bus_layouts(layout_id)
);

-- 4. ROUTE MANAGEMENT & FARES
CREATE TABLE stops (
    stop_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stop_name VARCHAR(100) NOT NULL,
    district VARCHAR(50),
    state VARCHAR(50),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7)
);
CREATE INDEX idx_stop_name ON stops(stop_name);

CREATE TABLE routes (
    route_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_number VARCHAR(20) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    source_stop_id BIGINT NOT NULL,
    destination_stop_id BIGINT NOT NULL,
    total_distance DECIMAL(6,2),
    estimated_duration INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (source_stop_id) REFERENCES stops(stop_id),
    FOREIGN KEY (destination_stop_id) REFERENCES stops(stop_id)
);

CREATE TABLE route_stops (
    route_stop_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT NOT NULL,
    stop_id BIGINT NOT NULL,
    sequence_no INT NOT NULL,
    distance_from_source DECIMAL(6,2),
    expected_arrival_offset INT, -- Minutes from start
    expected_departure_offset INT, -- Minutes from start
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id),
    UNIQUE(route_id, sequence_no),
    UNIQUE(route_id, stop_id)
);

CREATE TABLE route_fares (
    fare_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT NOT NULL,
    from_stop_id BIGINT NOT NULL,
    to_stop_id BIGINT NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (from_stop_id) REFERENCES stops(stop_id),
    FOREIGN KEY (to_stop_id) REFERENCES stops(stop_id),
    UNIQUE(route_id, from_stop_id, to_stop_id)
);

-- 5. OPERATIONS & LIVE TRACKING
CREATE TABLE trips (
    trip_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    conductor_id BIGINT,
    driver_id BIGINT,
    departure_date DATE NOT NULL,
    arrival_date DATE,
    actual_departure DATETIME,
    actual_arrival DATETIME,
    status ENUM('SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (conductor_id) REFERENCES users(user_id),
    FOREIGN KEY (driver_id) REFERENCES users(user_id)
);
CREATE INDEX idx_trip_route_date ON trips(route_id, departure_date);

CREATE TABLE trip_stops (
    trip_stop_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    route_stop_id BIGINT NOT NULL,
    arrival_time DATETIME,
    departure_time DATETIME,
    platform VARCHAR(20),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY (route_stop_id) REFERENCES route_stops(route_stop_id)
);
CREATE INDEX idx_trip_stop ON trip_stops(trip_id, route_stop_id);

CREATE TABLE bus_locations (
    location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed INT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- 6. RESERVATIONS & SEAT TRACKING
CREATE TABLE bookings (
    booking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    passenger_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    boarding_stop_id BIGINT,
    dropping_stop_id BIGINT,
    booked_by BIGINT,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancellation_time DATETIME,
    cancelled_by BIGINT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    booking_status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY (cancelled_by) REFERENCES users(user_id)
);
CREATE INDEX idx_booking_passenger ON bookings(passenger_id, booking_status);

CREATE TABLE seat_availability (
    availability_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    layout_seat_id BIGINT NOT NULL,
    booking_id BIGINT,
    status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED') DEFAULT 'AVAILABLE',
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY (layout_seat_id) REFERENCES bus_layout_seats(layout_seat_id),
    UNIQUE(trip_id, layout_seat_id)
);

CREATE TABLE booking_passengers (
    booking_passenger_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    layout_seat_id BIGINT NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (layout_seat_id) REFERENCES bus_layout_seats(layout_seat_id)
);

CREATE TABLE tickets (
    ticket_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    pdf_url TEXT,
    download_count INT DEFAULT 0,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    gateway VARCHAR(50),
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_status ENUM('NOT_APPLICABLE', 'PENDING', 'PROCESSED') DEFAULT 'NOT_APPLICABLE',
    paid_at DATETIME,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- 7. MAINTENANCE & DEPOT INVENTORY
CREATE TABLE maintenance_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_id BIGINT NOT NULL,
    reported_by BIGINT,
    issue_description TEXT,
    status ENUM('REPORTED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'REPORTED',
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id)
);

CREATE TABLE fuel_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_id BIGINT NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    filled_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
    FOREIGN KEY (filled_by) REFERENCES users(user_id)
);

-- 8. CUSTOMER EXPERIENCE
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    passenger_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- 9. ADMINISTRATION
CREATE TABLE audit_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE system_settings (
    setting_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
