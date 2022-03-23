<?php
 
 
namespace App\Modules\MainFrame;
 
class Installer
{
 
    /**
     *
     * @param PackageEvent $event
     * @return void
     */
    public static function PostPackageInstall($event)
    {
 
        print_r('Установка и настройка модуля Основное окно Бухсофт'."\n");
 
        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir').'/';
        $configDir = './config/';
 
        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }
 
        $mode = 'dev';
        $appYamlContent = file_get_contents($configDir.'app.yaml');
        if(preg_match('/mode: (\w+)/', $appYamlContent, $matches) >=0 ) {
            $mode = $matches[1];
        }
 
        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;
 
        // копируем конфиг
        print_r('Копируем файл конфигурации'."\n");
        $configPath = $path.'/src/MainFrame/config-template/module-'.$mode.'.yaml';
        $configTargetPath = $configDir.'mainframe.yaml';
        if(file_exists($configTargetPath)) {
            print_r('Файл конфигурации найден, пропускаем настройку'."\n");
            return;
        }
        copy($configPath, $configTargetPath);
 
        // нужно прописать в модули
        $modulesTargetPath = $configDir.'modules.yaml';
        $modulesConfigContent = file_get_contents($modulesTargetPath);
        if(strstr($modulesConfigContent, '- name: MainFrame') !== false) {
            print_r('Модуль сконфигурирован, пропускаем'."\n");
            return;
        }
 
        $modulesConfigContent = $modulesConfigContent.'
  - name: MainFrame
    entry: \MainFrame\Module
    enabled: true
    config: include(/config/mainframe.yaml)';
        file_put_contents($modulesTargetPath, $modulesConfigContent);
 
        print_r('Установка скриптов'."\n");
        $scriptsPath = $path.'/src/MainFrame/bin/';
        $binDir = './bin/';
 
        copy($scriptsPath.'mainframe-migrate.sh', $binDir.'mainframe-migrate.sh');

        print_r('Копирование изображений'."\n");

        $sourcePath = $path.'/src/MainFrame/web/res/img/';
        $targetDir = './web/res/img/';

        copy($sourcePath.'mainframe-logo-buhsoft.svg', $targetDir.'mainframe-logo-buhsoft.svg');
        copy($sourcePath.'mainframe-logo-gb247.svg', $targetDir.'mainframe-logo-gb247.svg');
 
        print_r('Установка завершена'."\n");
 
    }
}