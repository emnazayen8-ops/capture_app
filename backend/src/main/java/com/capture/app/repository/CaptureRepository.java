package com.capture.app.repository;

import com.capture.app.entity.Capture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaptureRepository extends JpaRepository<Capture, Long> {

    @Query("SELECT COUNT(c) FROM Capture c WHERE c.menu.id = :menuId")
    Long countByMenuId(@Param("menuId") Long menuId);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(name, 9) AS UNSIGNED)) FROM captures " +
            "WHERE menu_id = :menuId AND name REGEXP '^Capture [0-9]+$'", nativeQuery = true)
    Integer findMaxCaptureNumber(@Param("menuId") Long menuId);

    void deleteByIdIn(List<Long> ids);
    List<Capture> findByIdIn(List<Long> ids);

    @Query("SELECT c FROM Capture c WHERE c.menu.id = :menuId ORDER BY c.sortOrder ASC, c.dateCreate ASC")
    List<Capture> findByMenuIdOrderedBySortOrder(@Param("menuId") Long menuId);
}
