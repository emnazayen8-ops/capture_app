package com.capture.app.repository;

import com.capture.app.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByParentId(Long parentId);

    boolean existsByParentId(Long parentId);

    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.parent WHERE m.parent IS NULL AND m.module.id = :moduleId ORDER BY m.dateCreate")
    List<Menu> findRootMenusByModuleId(@Param("moduleId") Long moduleId);

}
