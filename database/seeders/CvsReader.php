<?php

namespace Database\Seeders;

class CvsReader
{
    public static function read(string $filename): array
    {
        $file = fopen(storage_path("app/data/csv/{$filename}.csv"), 'r');
        $header = fgetcsv($file);
        $data = [];

        while ($row = fgetcsv($file)){
            $data[] = array_combine($header, $row);
        }

        fclose($file);

        return $data;
    }
}
