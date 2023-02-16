<?php

namespace App\Modules\MainFrame\Controllers;

use App\Modules\MainFrame\Threading\StatusWorker;
use Colibri\App;
use App\Modules\MainFrame\Module;
use Colibri\Threading\Process;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Dashboard controller
 * @author self
 * @package App\Modules\MainFrame\Controllers
 */
class DashboardController extends WebController
{

    /**
     * Gets a fpm status
     * @param RequestCollection $get данные GET
     * @param RequestCollection $post данные POST
     * @param mixed $payload данные payload обьекта переданного через POST/PUT
     * @return object
     */
    public function Status(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload = null): object
    {

        $code = 200;
        $result = [];
        $message = 'Result message';
        try {

            $process = Process::ByWorkerName('StatusWorker');
            if(App::$isLocal && $process) {
                $process->Stop();
                $process = null;
            }

            if(!$process) {
        
                $currentUser = \App\Modules\Security\Module::$instance->current;
                $userGUID = md5($currentUser->id);
                
                $worker = new StatusWorker();
                $process = Process::Create($worker);
                $process->Run((object)['user' => $userGUID, 'requester' => App::$request->headers->requester]);

            }

            if(!$process->IsRunning()) {
                throw new InvalidArgumentException('Can not start worker', 500);
            }

            $result = [];

            /** @var StatusWorker */
            $worker = $process->worker;
            $fpmStatus = $worker->GetFpmStatus();
            if($fpmStatus) {
                $result['fpm'] = $fpmStatus;
            }

            $serverStatus = $worker->GetServerStatus();
            if($serverStatus) {
                $result['server'] = $serverStatus;
            }
            
            $databaseStatus = $worker->GetDatabaseStatus();
            if($databaseStatus) {
                $result['databases'] = array_values($databaseStatus);
            }


        } catch (\Throwable $e) {
            // если что то не так то выводим ошибку
            $message = $e->getMessage() . ' ' . $e->getFile() . ' ' . $e->getLine();
            $code = $e->getCode();
            App::$log->debug($message);
        }

        // финишируем контроллер
        return $this->Finish(
            $code,
            $message,
            $result,
            'utf-8'
        );

    }


    
}