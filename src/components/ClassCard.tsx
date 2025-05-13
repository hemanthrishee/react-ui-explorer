
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, Calendar, Users } from 'lucide-react';
import { Class } from '@/types/user';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ClassCardProps {
  classData: Class;
  isEnrolled?: boolean;
  isPending?: boolean;
  onRequestJoin?: () => void;
  onViewDetails: () => void;
}

const ClassCard = ({ 
  classData, 
  isEnrolled = false, 
  isPending = false, 
  onRequestJoin, 
  onViewDetails 
}: ClassCardProps) => {
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {classData.teacherImage ? (
          <img 
            src={classData.teacherImage} 
            alt={`${classData.title} cover`}
            className="w-full h-full object-cover opacity-70"
          />
        ) : null}
        <Badge 
          className="absolute top-3 right-3" 
          variant={classData.isFree ? "default" : "secondary"}
        >
          {classData.isFree ? 'Free' : 'Paid'}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-2">{classData.title}</h3>
            <p className="text-sm text-gray-500">
              {classData.topic}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{classData.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{classData.currentStudents}{classData.maxStudents ? `/${classData.maxStudents}` : ''} Students</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Start: {formatDate(classData.startDate)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button onClick={onViewDetails} variant="outline" size="sm">
          View Details
        </Button>
        
        {!isEnrolled && !isPending && onRequestJoin && (
          <Button onClick={onRequestJoin} size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Join Class
          </Button>
        )}
        
        {isPending && (
          <Badge variant="secondary">Request Pending</Badge>
        )}
        
        {isEnrolled && (
          <Badge variant="success">Enrolled</Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
