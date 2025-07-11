import React, { useState } from 'react';

const TimeSelector = ({ times, selectedTime, setSelectedTime, onConfirm }) => {
  const [error, setError] = useState(''); // Estado para mostrar errores

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Validación de formato de hora (e.g., "1:00PM", "12:30 AM", "11:30am")
  const isValidTimeFormat = (value) => {
    if (!value) return false;
    // Acepta horas con o sin espacio antes de AM/PM, y AM/PM en mayúsculas o minúsculas
    const timeRegex = /^([1-9]|1[0-2]):[0-5][0-9](?:\s)?(AM|PM|am|pm)$/i;
    return timeRegex.test(value.trim());
  };

  // Convertir hora en formato 12h a minutos desde medianoche para comparación
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const cleanedTime = timeStr.trim();
    // Separar tiempo y período (AM/PM) con o sin espacio
    const timeMatch = cleanedTime.match(/^(\d{1,2}:\d{2})(?:\s)?([AaPp][Mm])$/i);
    if (!timeMatch) {
      throw new Error(`Formato de hora inválido: ${timeStr}`);
    }

    const [, time, period] = timeMatch;
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Formato de hora inválido: ${timeStr}`);
    }

    let totalMinutes = hours * 60 + minutes;
    if (period.toUpperCase() === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period.toUpperCase() === 'AM' && hours === 12) totalMinutes = minutes; // 12 AM es medianoche
    return totalMinutes;
  };

  // Validar si la hora está dentro del rango de servicio (11:30 AM - 3:50 PM)
  const isWithinServiceHours = (timeStr) => {
    try {
      const inputMinutes = timeToMinutes(timeStr);
      const startMinutes = 11 * 60 + 30; // 11:30 AM = 690 minutos
      const endMinutes = 15 * 60 + 50;  // 3:50 PM = 950 minutos
      console.log(`Validando ${timeStr}: ${inputMinutes} minutos, rango: ${startMinutes}-${endMinutes}`);
      return inputMinutes >= startMinutes && inputMinutes <= endMinutes;
    } catch (error) {
      console.error(`Error en isWithinServiceHours para ${timeStr}: ${error.message}`);
      return false;
    }
  };

  const handleCustomTimeChange = (e) => {
    const value = e.target.value;
    setSelectedTime({ id: 0, name: value });
    setError(''); // Limpiamos el error al escribir
  };

  const handleConfirm = () => {
    if (!selectedTime || !selectedTime.name) {
      setError('Por favor, ingresa una hora válida (Ej: 1:00 PM)');
      console.log('Error: selectedTime es nulo o no tiene name');
      return;
    }

    console.log(`Confirmando hora: ${selectedTime.name}, id: ${selectedTime.id}`);

    if (selectedTime.id === 0) {
      if (!isValidTimeFormat(selectedTime.name)) {
        setError('Por favor, ingresa una hora válida (Ej: 1:00 PM)');
        console.log(`Error: Formato inválido para ${selectedTime.name}`);
        return;
      }
      if (!isWithinServiceHours(selectedTime.name)) {
        setError('👉 No tenemos almuerzo a esa hora solo de 11:30am a 3:50pm');
        console.log(`Error: ${selectedTime.name} fuera del rango 11:30 AM - 3:50 PM`);
        return;
      }
    } else if (!isWithinServiceHours(selectedTime.name)) {
      setError('👉 No tenemos almuerzo a esa hora');
      console.log(`Error: Hora predefinida ${selectedTime.name} fuera del rango 11:30 AM - 3:50 PM`);
      return;
    }

    console.log(`Hora válida confirmada: ${selectedTime.name}`);
    onConfirm();
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 p-1 xs:p-2 sm:p-3 rounded-lg shadow-sm">
      <h2 className="text-[10px] xs:text-xs sm:text-sm font-semibold mb-1 xs:mb-2 flex items-center text-green-700">
        <span className="mr-1">🕒</span> ¿Para qué hora?
      </h2>
      <div className="grid grid-cols-2 xs:grid-cols-2 gap-1 xs:gap-2">
        {times.map(time => (
          <button
            key={time.id}
            onClick={() => {
              setSelectedTime(time);
              setError('');
              console.log(`Hora seleccionada: ${time.name}, id: ${time.id}`);
            }}
            className={`relative p-1 xs:p-2 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center text-center min-h-[30px] xs:min-h-[40px] shadow-sm ${
              selectedTime?.id === time.id
                ? 'bg-green-200 text-green-800 border border-green-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            aria-label={`Seleccionar hora ${time.name}`}
          >
            {time.name}
          </button>
        ))}
        <input
          type="text"
          placeholder="Otra hora (e.g., 1:00 PM)"
          value={selectedTime?.id === 0 ? selectedTime.name : ''}
          onChange={handleCustomTimeChange}
          onKeyDown={handleKeyDown}
          className="col-span-2 mt-2 p-1 xs:p-2 text-[10px] xs:text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 w-full"
          aria-label="Ingresar una hora personalizada"
        />
        {error && (
          <p className="text-[10px] xs:text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
      <button
        onClick={handleConfirm}
        disabled={!selectedTime || !selectedTime.name}
        className={`mt-2 bg-green-500 hover:bg-green-600 text-white px-2 xs:px-3 py-0.5 xs:py-1 rounded-lg text-[10px] xs:text-xs sm:text-sm transition-colors ${
          !selectedTime || !selectedTime.name ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Confirmar hora"
      >
        Confirmar hora
      </button>
    </div>
  );
};

export default TimeSelector;