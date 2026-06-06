package com.aptisfullstack.repository;

import com.aptisfullstack.domain.Notification;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findTop20ByOrderByCreatedAtDesc();
  List<Notification> findAllByOrderByCreatedAtDesc();
  @Query("select n from Notification n where n.targetRole is null or n.targetRole in :targetRoles order by n.createdAt desc")
  List<Notification> visibleTop20(@Param("targetRoles") List<String> targetRoles, Pageable pageable);

  @Query("select n from Notification n where n.targetRole is null or n.targetRole in :targetRoles order by n.createdAt desc")
  List<Notification> visibleAll(@Param("targetRoles") List<String> targetRoles);
}
