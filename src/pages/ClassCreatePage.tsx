
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

import styles from './ClassCreatePage.module.css';
import miniStyles from './ClassPreviewMini.module.css';
import sliderStyles from './ClassPreviewSlider.module.css';
import ClassCard from '@/components/ClassCard';

const ClassCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [maxStudents, setMaxStudents] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number | null>(null);
  const [teacherQualifications, setTeacherQualifications] = useState('');
  const [teacherExpertise, setTeacherExpertise] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [classImage, setClassImage] = useState<string | null>(null);

  // Prepare classData for ClassCard preview
  const classPreviewData = {
    id: 'preview',
    teacherId: user?.email || '',
    title: title || 'Class Title',
    topic: topic || 'Topic',
    description: description || 'Class description will appear here.',
    maxStudents: maxStudents ?? null,
    currentStudents: 0,
    isFree: isFree,
    price: price ?? undefined,
    teacherImage: classImage || user?.profilePicture || '',
    teacherQualifications: teacherQualifications || user?.qualifications || '',
    teacherExpertise: teacherExpertise || user?.expertise || '',
    registrationDeadline: registrationDeadline ?? null,
    startDate: startDate ?? null,
    status: 'upcoming' as 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const handleCreateClass = async () => {
    console.log('Create class button clicked');
    // Validation
    if (title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (topic.length < 3) {
      toast.error("Topic must be at least 3 characters");
      return;
    }
    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    if (teacherQualifications.length < 10) {
      toast.error("Qualifications must be at least 10 characters");
      return;
    }
    if (teacherExpertise.length < 5) {
      toast.error("Expertise must be at least 5 characters");
      return;
    }
    if (!isFree && (!price || price <= 0)) {
      toast.error("Please enter a valid price for paid classes");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data to send to API
      const classData = {
        title,
        topic,
        description,
        maxStudents,
        isFree,
        price,
        teacherQualifications,
        teacherExpertise,
        registrationDeadline,
        startDate,
        classImage,
        teacherId: user?.email, // Only send teacherId, not all teacher data
        currentStudents: 0,
        status: 'upcoming',
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
      
      <div className="space-y-8">
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
              <label className="block text-sm font-medium mb-1">Class Image</label>
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

            <div>
              <label className="block text-sm font-medium mb-1">Class Title</label>
              <Input 
                placeholder="Introduction to Programming" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-1"
              />
              {title.length < 5 && title.length > 0 && (
                <p className="text-sm text-red-500">Title must be at least 5 characters</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <Input 
                placeholder="Programming, Web Development, etc." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mb-1"
              />
              {topic.length < 3 && topic.length > 0 && (
                <p className="text-sm text-red-500">Topic must be at least 3 characters</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                placeholder="Describe what students will learn in this class" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 mb-1"
              />
              {description.length < 20 && description.length > 0 && (
                <p className="text-sm text-red-500">Description must be at least 20 characters</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Students (Optional)</label>
                <Input 
                  type="number" 
                  placeholder="Leave empty for unlimited" 
                  value={maxStudents === null ? '' : maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <label className="block text-sm font-medium">Free Class</label>
                  <Switch
                    checked={isFree}
                    onCheckedChange={setIsFree}
                  />
                </div>
                
                {!isFree && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="29.99"
                      value={price === null ? '' : price}
                      onChange={(e) => setPrice(e.target.value === '' ? null : Number(e.target.value))}
                      className="mb-1"
                    />
                    {!isFree && (!price || price <= 0) && (
                      <p className="text-sm text-red-500">Please enter a valid price for paid classes</p>
                    )}
                  </div>
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

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Qualifications</label>
              <Textarea 
                placeholder="Your education, certifications, awards, etc." 
                value={teacherQualifications}
                onChange={(e) => setTeacherQualifications(e.target.value)}
                className="mb-1"
              />
              {teacherQualifications.length < 10 && teacherQualifications.length > 0 && (
                <p className="text-sm text-red-500">Qualifications must be at least 10 characters</p>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Areas of Expertise</label>
              <Textarea 
                placeholder="Technologies, skills, subjects, etc." 
                value={teacherExpertise}
                onChange={(e) => setTeacherExpertise(e.target.value)}
                className="mb-1"
              />
              {teacherExpertise.length < 5 && teacherExpertise.length > 0 && (
                <p className="text-sm text-red-500">Expertise must be at least 5 characters</p>
              )}
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
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Registration Deadline (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !registrationDeadline && "text-muted-foreground"
                      )}
                    >
                      {registrationDeadline ? (
                        format(registrationDeadline, "PPP")
                      ) : (
                        <span>No deadline (open enrollment)</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationDeadline || undefined}
                      onSelect={setRegistrationDeadline}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Select start date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={setStartDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/classes')}>
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isSubmitting} 
            onClick={handleCreateClass}
          >
            {isSubmitting ? "Creating..." : "Create Class"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassCreatePage;
