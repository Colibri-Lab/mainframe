<?php
 
 
namespace App\Modules\MainFrame;
 
class Installer
{

    private static function _loadConfig($file): array
    {
        return yaml_parse_file($file);
    }

    private static function _saveConfig($file, $config): void
    {
        yaml_emit_file($file, $config, \YAML_UTF8_ENCODING, \YAML_ANY_BREAK);
    }

    private static function _getMode($file): string
    {
        $appConfig = self::_loadConfig($file);
        return $appConfig['mode'];
    }

    private static function _injectIntoModuleConfig($file): void
    {

        $modules = self::_loadConfig($file);
        if(is_array($modules['entries'])) {
            foreach($modules['entries'] as $entry) {
                if($entry['name'] === 'MainFrame') {
                    return;
                }
            }
        }
        else {
            $modules['entries'] = [];
        }

        $modules['entries'][] = [
            'name' => 'MainFrame',
            'entry' => '\MainFrame\Module',
            'desc' => 'Основное окно административного интерфейса',
            'enabled' => true,
            'visible' => false,
            'for' => ['manage'],
            'config' => 'include(/config/mainframe.yaml)'
        ];

        self::_saveConfig($file, $modules);

    }

    private static function _copyOrSymlink($mode, $pathFrom, $pathTo, $fileFrom, $fileTo, $forceCopy = false): void 
    {
        print_r('Копируем '.$mode.' '.$pathFrom.' '.$pathTo.' '.$fileFrom.' '.$fileTo."\n");
        if(!file_exists($pathFrom.$fileFrom)) {
            print_r('Файл '.$pathFrom.$fileFrom.' не существует'."\n");
            return;
        }

        if(file_exists($pathTo.$fileTo)) {
            print_r('Файл '.$pathTo.$fileTo.' существует'."\n");
            return;
        }

        if($mode === 'local' && !$forceCopy) {
            shell_exec('ln -s '.realpath($pathFrom.$fileFrom).' '.$pathTo.($fileTo != $fileFrom ? $fileTo : ''));
        }
        else {
            shell_exec('cp -R '.realpath($pathFrom.$fileFrom).' '.$pathTo.$fileTo);
        }

        // если это исполняемый скрипт
        if(strstr($pathTo.$fileTo, '/bin/') !== false) {
            chmod($pathTo.$fileTo, 0777);
        }
    }
 
    /**
     *
     * @param PackageEvent $event
     * @return void
     */
    public static function PostPackageInstall($event)
    {
 
        print_r('Установка и настройка модуля Основное окно Бухсофт'."\n");
 
        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir').'/';
        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;
        $configPath = $path.'/src/MainFrame/config-template/';
        $configDir = './config/';

        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }
 
        $mode = self::_getMode($configDir.'app.yaml');

        // копируем конфиг
        print_r('Копируем файлы конфигурации'."\n");
        self::_copyOrSymlink($mode, $configPath, $configDir, 'module-'.$mode.'.yaml', 'mainframe.yaml');
        self::_copyOrSymlink($mode, $configPath, $configDir, 'mainframe-menu.yaml', 'mainframe-menu.yaml', true);

        print_r('Встраиваем модуль'."\n");
        self::_injectIntoModuleConfig($configDir.'modules.yaml');
 
        print_r('Установка скриптов'."\n");
        self::_copyOrSymlink($mode, $path.'/src/MainFrame/bin/', './bin/', 'mainframe-migrate.sh', 'mainframe-migrate.sh');

        print_r('Копирование изображений'."\n");
        self::_copyOrSymlink($mode, $path.'/src/MainFrame/web/res/img/', './web/res/img/', 'mainframe-logo-colibri.svg', 'mainframe-logo-colibri.svg');
        self::_copyOrSymlink($mode, $path.'/src/MainFrame/web/res/img/', './web/res/img/', 'loading-icon.svg', 'loading-icon.svg');

        print_r('Установка завершена'."\n");
 
    }
}