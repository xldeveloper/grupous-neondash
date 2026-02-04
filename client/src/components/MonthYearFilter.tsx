import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MonthYearFilterProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export default function MonthYearFilter({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: MonthYearFilterProps) {
  // Create a date object from the selected month/year (using 1st day)
  // Note: selectedMonth seems to be 1-based (1=Jan, 12=Dec) based on previous code
  const date = new Date(selectedYear, selectedMonth - 1, 1);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      onYearChange(newDate.getFullYear());
      onMonthChange(newDate.getMonth() + 1); // Convert 0-index back to 1-index
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? (
            <span className="capitalize">{format(date, "MMMM / yyyy", { locale: ptBR })}</span>
          ) : (
            <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={ptBR}
          classNames={{
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
