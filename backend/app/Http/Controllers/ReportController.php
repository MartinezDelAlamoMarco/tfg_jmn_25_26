<?php
namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    // Obtener los tipos de reporte para el formulario de React
    public function getTypes()
    {
        return response()->json(ReportType::all());
    }

    // Guardar la denuncia
    public function store(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'report_type_id' => 'required|exists:report_types,id',
            'description' => 'nullable|string|max:1000',
        ]);

        $userId = Auth::id(); // O el ID que obtengas del token

        // REGLA DE NEGOCIO: Prevención de duplicados
        // Buscamos si ya existe un reporte 'pendiente' de este usuario para este anuncio
        $existingReport = Report::where('reporter_id', $userId)
            ->where('advertisement_id', $request->advertisement_id)
            ->where('status', 'pendiente') // Solo bloqueamos si aún no se ha resuelto
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'Ya has reportado este anuncio. Tu denuncia está siendo revisada.'
            ], 422);
        }

        // Crear el reporte
        $report = Report::create([
            'reporter_id' => $userId,
            'advertisement_id' => $request->advertisement_id,
            'report_type_id' => $request->report_type_id,
            'description' => $request->description,
            'status' => 'pendiente'
        ]);

        return response()->json([
            'message' => 'Reporte enviado correctamente.',
            'report' => $report
        ], 201);
    }
}