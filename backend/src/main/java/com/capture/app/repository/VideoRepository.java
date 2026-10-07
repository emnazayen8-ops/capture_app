package com.capture.app.repository;

import com.capture.app.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    Optional<Video> findByMenuId(Long menuId);

    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Video v WHERE v.menu.id = :menuId")
    boolean hasVideo(@Param("menuId") Long menuId);
}