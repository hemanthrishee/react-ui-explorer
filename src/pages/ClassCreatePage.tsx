import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Define API URL - In a real app, this would come from environment variables
const API_URL = 'https://api.example.com'; // Replace with your actual API URL

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  topic: z.string().min(3, "Topic must be at least 3 characters").max(50),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  maxStudents: z.number().nullable().optional(),
  isFree: z.boolean().default(true),
  price: z.number().nullable().optional(),
  teacherQualifications: z.string().min(10, "Qualifications must be at least 10 characters").max(200),
  teacherExpertise: z.string().min(5, "Expertise must be at least 5 characters").max(200),
  registrationDeadline: z.date().nullable(),
  startDate: z.date().nullable(),
});

type FormData = z.infer<typeof formSchema>;

import styles from './ClassCreatePage.module.css';
import miniStyles from './ClassPreviewMini.module.css';
import sliderStyles from './ClassPreviewSlider.module.css';
import ClassCard from '@/components/ClassCard';

const ClassCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);

  const [classImage, setClassImage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      topic: '',
      description: '',
      maxStudents: null,
      isFree: true,
      price: null,
      teacherQualifications: '',
      teacherExpertise: '',
      registrationDeadline: null,
      startDate: null,
    }
  });

  const { watch } = form;
  const watchedFields = watch();
  const isFree = watchedFields.isFree;

  // Prepare classData for ClassCard preview
  const classPreviewData = {
    id: 'preview',
    teacherId: user?.email || '',
    title: watchedFields.title || 'Class Title',
    topic: watchedFields.topic || 'Topic',
    description: watchedFields.description || 'Class description will appear here.',
    maxStudents: watchedFields.maxStudents ?? null,
    currentStudents: 0,
    isFree: isFree,
    price: watchedFields.price ?? undefined,
    teacherImage: classImage || user?.profilePicture || '',
    teacherQualifications: watchedFields.teacherQualifications || user?.qualifications || '',
    teacherExpertise: watchedFields.teacherExpertise || user?.expertise || '',
    registrationDeadline: watchedFields.registrationDeadline ?? null,
    startDate: watchedFields.startDate ?? null,
    status: 'upcoming' as 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Optionally add classImage if ClassCard supports it
  };


  const handleClassImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setClassImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('Create class button clicked');
    if (!isFree && (!data.price || data.price <= 0)) {
      form.setError('price', {
        type: 'manual',
        message: 'Please enter a valid price for paid classes',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data to send to API - only include teacherId, not all teacher data
      const classData = {
        ...data,
        classImage,
        teacherId: user?.email,
        currentStudents: 0,
        status: 'upcoming' as 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Sending data to API:', classData);
      
      // Make the POST request to the API
      const response = await fetch(`${API_URL}/classes/create-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create class');
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      toast.success("Class created successfully!");
      navigate('/classes');
      
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Sticky Preview Tab */}
      <div
        style={{
          position: 'fixed',
          top: '40%',
          left: 0,
          zIndex: 1201,
          display: 'flex',
          alignItems: 'center',
          transition: 'left 0.3s',
        }}
      >
        <button
          type="button"
          className={sliderOpen ? `${sliderStyles.sliderTab} ${sliderStyles.sliderTabOpen}` : sliderStyles.sliderTab}
          style={{ transform: sliderOpen ? 'translateX(370px)' : 'none' }}
          onClick={() => setSliderOpen((open) => !open)}
          aria-label={sliderOpen ? 'Close preview' : 'Open preview'}
        >
          <span className={sliderStyles.sliderTabText}>
            {sliderOpen ? 'Close' : 'Preview'}
          </span>
        </button>
      </div>

      {/* Slider Overlay */}
      <div
        className={
          sliderOpen
            ? sliderStyles.sliderOverlay
            : sliderStyles.sliderOverlay + ' ' + sliderStyles.sliderOverlayHidden
        }
        onClick={() => setSliderOpen(false)}
        style={{ transition: 'opacity 0.2s' }}
      />

      {/* Slider Drawer */}
      <div
        className={
          sliderOpen
            ? sliderStyles.sliderDrawer + ' ' + sliderStyles.sliderDrawerOpen
            : sliderStyles.sliderDrawer
        }
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        style={{ boxShadow: sliderOpen ? '2px 0 16px rgba(0,0,0,0.13)' : undefined }}
      >
        <div className={sliderStyles.sliderHeader}>
          Live Student Preview
          <button
            className={sliderStyles.sliderCloseBtn}
            onClick={() => setSliderOpen(false)}
            aria-label="Close preview"
            type="button"
          >
            ×
          </button>
        </div>
        <div className={sliderStyles.sliderContent}>
          <ClassCard
            classData={classPreviewData}
            onViewDetails={() => {}}
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create a New Class</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the basic details about your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class Image Upload */}
              <div>
                <FormLabel>Class Image</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                    {classImage ? (
                      <>
                        <img 
                          src={classImage} 
                          alt="Class" 
                          className="h-full w-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setClassImage(null)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(255,255,255,0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                          }}
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>×</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleClassImageChange}
                    className="w-auto"
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to Programming" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Programming, Web Development, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what students will learn in this class" 
                        {...field} 
                        className="min-h-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty for unlimited" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Free Class</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {!isFree && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="29.99"
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Teacher Information</CardTitle>
            </CardHeader>
            <CardContent>
  <div className={styles.teacherIdCard}>
    <div className={styles.teacherAvatar}>
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Teacher"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User className="h-10 w-10 text-gray-500" />
        </div>
      )}
    </div>
    <div className={styles.teacherDetails}>
      <div className={styles.teacherName}>{user?.name ?? 'N/A'}</div>
      <div className={styles.teacherEmail}>{user?.email ?? 'N/A'}</div>
      <div className={styles.teacherRole}>Role: {user?.role ?? 'N/A'}</div>
      <div className={styles.teacherInfoRow}>
        <span className={styles.teacherLabel}>Qualifications:</span> {user?.qualifications ?? 'N/A'}
      </div>
      <div className={styles.teacherInfoRow}>
        <span className={styles.teacherLabel}>Expertise:</span> {user?.expertise ?? 'N/A'}
      </div>
    </div>
  </div>
</CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Set important dates for your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Deadline (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No deadline (open enrollment)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/classes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClassCreatePage;
