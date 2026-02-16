import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.string(), // ISO datetime
  end: z.string(), // ISO datetime
  startTime: z.string(), // HTMP time input format HH:mm
  endTime: z.string(), // HTML time input format HH:mm
  allDay: z.boolean().default(false),
  location: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: { start: Date; end: Date; allDay?: boolean };
  onSuccess?: () => void;
}

export function EventFormDialog({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: EventFormDialogProps) {
  const utils = trpc.useUtils();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      allDay: defaultDate?.allDay || false,
      location: "",
      start:
        defaultDate?.start.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      end: defaultDate?.end.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      startTime:
        defaultDate?.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
        "09:00",
      endTime:
        defaultDate?.end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
        "10:00",
    },
  });

  // Reset form when dialog opens with new default dates
  React.useEffect(() => {
    if (open && defaultDate) {
      form.reset({
        title: "",
        description: "",
        allDay: defaultDate.allDay || false,
        location: "",
        start: defaultDate.start.toISOString().split("T")[0],
        end: defaultDate.end.toISOString().split("T")[0],
        startTime:
          defaultDate.start.getHours().toString().padStart(2, "0") +
          ":" +
          defaultDate.start.getMinutes().toString().padStart(2, "0"),
        endTime:
          defaultDate.end.getHours().toString().padStart(2, "0") +
          ":" +
          defaultDate.end.getMinutes().toString().padStart(2, "0"),
      });
    }
  }, [open, defaultDate, form]);

  const createEventMutation = trpc.calendar.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created! The new event has been added to your calendar.");
      utils.calendar.getEvents.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating event: ${error.message}`);
    },
  });

  const onSubmit = (values: EventFormValues) => {
    // Combine date and time
    const startDate = new Date(`${values.start}T${values.startTime}:00`);
    const endDate = new Date(`${values.end}T${values.endTime}:00`);

    createEventMutation.mutate({
      title: values.title,
      description: values.description,
      location: values.location,
      allDay: values.allDay,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141820] border-[#C6A665]/30 text-slate-200 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#C6A665] font-serif text-xl">New Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g.: Consultation Dr. Smith"
                      className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g.: Room 1"
                      className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event details..."
                      className="bg-[#0B0E14] border-slate-700 focus:border-[#C6A665] min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-800 p-3 shadow-sm bg-[#0B0E14]">
                  <div className="space-y-0.5">
                    <FormLabel>All Day</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className="bg-[#C6A665] hover:bg-[#C6A665]/90 text-black font-bold"
              >
                {createEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
