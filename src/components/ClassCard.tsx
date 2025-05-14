
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Calendar, Users } from 'lucide-react';
import { Class } from '@/types/user';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import styles from './ClassCard.module.css';

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
      {/* Banner Image */}
      {classData.teacherImage && (
        <img
          src={classData.teacherImage}
          alt={`${classData.title} cover`}
          className={styles.cardImage}
        />
      )}
      <div className={styles.cardHeaderRow} style={{ padding: '1rem 1.25rem 0.3rem 1.25rem' }}>
        <div style={{ flex: 1 }}>
          <div className={styles.cardTitle}>{classData.title}</div>
          <div className={styles.cardTopic}>{classData.topic}</div>
        </div>
        <Badge className={styles.cardBadge} variant={classData.isFree ? 'default' : 'secondary'}>
          {classData.isFree ? 'Free' : 'Paid'}
        </Badge>
      </div>
      <div className={styles.cardDivider} />
      <CardContent style={{ padding: '0 1.25rem 0.5rem 1.25rem' }}>
        <div className={styles.cardDescription}>{classData.description}</div>
        <div className={styles.cardMetaRow}>
          <div className={styles.cardMetaItem}>
            <Users className="h-4 w-4 text-gray-500" />
            <span>{classData.currentStudents}{classData.maxStudents ? `/${classData.maxStudents}` : ''} Students</span>
          </div>
          <div className={styles.cardMetaItem}>
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Start: {formatDate(classData.startDate)}</span>
          </div>
        </div>
      </CardContent>
      <div className={styles.cardDivider} />
      <CardFooter style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
        <div className={styles.cardFooterRow}>
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
            <CustomBadge variant="secondary">Request Pending</CustomBadge>
          )}
          {isEnrolled && (
            <CustomBadge variant="success">Enrolled</CustomBadge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
