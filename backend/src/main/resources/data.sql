-- IMPORTANT : spring.sql.init.mode=always exécute ce script à CHAQUE
-- démarrage de l'application. Avec de simples INSERT, les 4 modules
-- étaient donc dupliqués un peu plus à chaque redémarrage (bug corrigé
-- ici). INSERT IGNORE + la contrainte UNIQUE sur modules.name (voir
-- entity/Module.java) garantissent qu'une ligne "Module 1" (etc.) n'est
-- créée qu'une seule fois.
INSERT IGNORE INTO modules (name) VALUES ('Module 1');
INSERT IGNORE INTO modules (name) VALUES ('Module 2');
INSERT IGNORE INTO modules (name) VALUES ('Module 3');
INSERT IGNORE INTO modules (name) VALUES ('Module 4');
