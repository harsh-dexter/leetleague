
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TopicSelectorProps {
  selectedTopics: string[];
  onTopicToggle: (topic: string) => void;
  allTopics: string[];
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedTopics,
  onTopicToggle,
  allTopics,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayedTopics = showAll ? allTopics : allTopics.slice(0, 12);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Topics</label>
      <div className="flex flex-wrap gap-2">
        {displayedTopics.map(topic => (
          <Badge
            key={topic}
            variant={selectedTopics.includes(topic) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onTopicToggle(topic)}
          >
            {topic}
          </Badge>
        ))}
      </div>
      {!showAll && allTopics.length > 12 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View {allTopics.length - 12} more topics...
        </Button>
      )}
      {showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Show less
        </Button>
      )}
    </div>
  );
};

export default TopicSelector;
