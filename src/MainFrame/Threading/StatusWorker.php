<?php

namespace App\Modules\MainFrame\Threading;
use App\Modules\MainFrame\Module;
use Colibri\Common\VariableHelper;
use Colibri\IO\Request\Request;
use Colibri\IO\Request\Type;
use Colibri\Threading\Worker as BaseWorker;
use Colibri\Utils\Logs\MemoryLogger;
use Colibri\Events\EventsContainer;
use CometApiClient\Client;
use Colibri\App;
use Throwable;

class StatusWorker extends BaseWorker
{

    /**
     * Run the worker
     * @suppress PHP0420
     * @return void
     */
    public function Run(): void
    {

        $user = $this->_params->user;
        $requester = $this->_params->requester;

        $cometConfig = App::$config->Query('comet')->AsObject();
        $comet = new Client($cometConfig->host, $cometConfig->port);

        while(true) {
            sleep(Module::$instance->GetStatusWorkerTimer());
            $result = Module::$instance->RegisterStatusInfo();
            $comet->SendToUser($requester, $user, 'status', $result);
        }

    }
}