package com.keystone.backend.repository;

import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    // Find user by unique email
    Optional<UserEntity> findByEmail(String email);

    // Check if user exists by email (fixes compiler error in UserManagementService)
    boolean existsByEmail(String email);

    // Find users across all zones by role (used by SUPER_ADMIN)
    List<UserEntity> findByRole(Role role);

    // Find users by role and manager ID (fixes compiler error in UserManagementController)
    List<UserEntity> findByRoleAndManagerId(Role role, Long managerId);

    // Find users by zone ID and role (used by Managers for filtering Dispatchers, Technicians, Customers)
    List<UserEntity> findByZoneIdAndRole(Long zoneId, Role role);

    // Find all users assigned to a specific zone
    List<UserEntity> findByZoneId(Long zoneId);

    // Find all users managed by a specific manager's email
    List<UserEntity> findByManagerEmail(String managerEmail);

    // Custom query to fetch all non-admin subordinates in a given zone
    @Query("SELECT u FROM UserEntity u WHERE u.zoneId = :zoneId AND u.role != com.keystone.backend.entity.Role.SUPER_ADMIN")
    List<UserEntity> findSubordinatesByZoneId(@Param("zoneId") Long zoneId);
}