
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/data/mockData';

interface CompanySearchProps {
  selectedCompany: string;
  onCompanyChange: (companyId: string) => void;
  companies: Company[];
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  selectedCompany,
  onCompanyChange,
  companies,
}) => {
  const [open, setOpen] = useState(false);

  const selectedCompanyName = companies.find(c => c.id === selectedCompany)?.name || 'Select company';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Search className="h-4 w-4" />
        Company
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCompany && selectedCompany !== 'all' ? (
              <Badge variant="secondary">
                {selectedCompanyName}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Select company...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search companies..." />
            <CommandList>
              <CommandEmpty>No company found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onCompanyChange('all');
                    setOpen(false);
                  }}
                >
                  All Companies
                </CommandItem>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={() => {
                      onCompanyChange(company.id);
                      setOpen(false);
                    }}
                  >
                    {company.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CompanySearch;
