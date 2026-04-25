<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;

class GoogleDriveService
{
    protected $client;
    protected $drive;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        // Fuerza a la API a obtener un token de acceso fresco usando tu Refresh Token
        $this->client->fetchAccessTokenWithRefreshToken(env('GOOGLE_REFRESH_TOKEN'));
        
        $this->drive = new Drive($this->client);
    }

    /**
     * Busca la carpeta de la marca dentro de la principal, si no existe la crea.
     */
    private function getOrCreateBrandFolder($brandName)
    {
        $parentId = env('GOOGLE_DRIVE_PARENT_ID');
        
        if (!$parentId) {
            throw new \Exception("Falta la ID de la carpeta principal (GOOGLE_DRIVE_PARENT_ID) en el archivo .env");
        }
        
        // Buscar carpeta existente
        $query = "name = '{$brandName}' and '{$parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
        $results = $this->drive->files->listFiles(['q' => $query]);

        if (count($results->getFiles()) > 0) {
            return $results->getFiles()[0]->id;
        }

        // Crear carpeta si no existe
        $folderMetadata = new DriveFile([
            'name' => $brandName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$parentId]
        ]);

        $folder = $this->drive->files->create($folderMetadata, ['fields' => 'id']);
        
        // Dar permisos públicos a la carpeta
        $this->makeFilePublic($folder->id);

        return $folder->id;
    }

    /**
     * Sube la imagen y devuelve la URL del thumbnail.
     */
    public function uploadImageByBrand($filePath, $fileName, $brandName)
    {
        try {
            $brandFolderId = $this->getOrCreateBrandFolder($brandName);

            $fileMetadata = new DriveFile([
                'name' => $fileName,
                'parents' => [$brandFolderId]
            ]);

            $content = file_get_contents($filePath);

            $file = $this->drive->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => mime_content_type($filePath),
                'uploadType' => 'multipart',
                'fields' => 'id'
            ]);

            return [
                'file_id' => $file->id,
                'url' => "https://drive.google.com/thumbnail?id={$file->id}&sz=w1000"
            ];
        } catch (\Exception $e) {
            // Capturamos el error exacto de Google Drive para poder leerlo
            throw new \Exception("Error en Google Drive: " . $e->getMessage());
        }
    }

    private function makeFilePublic($fileId)
    {
        $permission = new Permission(['type' => 'anyone', 'role' => 'reader']);
        $this->drive->permissions->create($fileId, $permission);
    }
}