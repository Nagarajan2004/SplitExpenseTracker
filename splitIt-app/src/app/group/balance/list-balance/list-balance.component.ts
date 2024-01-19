import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { GroupService } from 'src/app/group.service';
import { Group } from 'src/app/models/group.model';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'app-list-balance',
  templateUrl: './list-balance.component.html',
  styleUrls: ['./list-balance.component.css']
})
export class ListBalanceComponent implements OnInit {
  groupId: string = '';
  members$!: any;
  groupDetails!: Group;
  currentUser: any;
  balanceWithNames!: any;
  settle: boolean = false;
  loading: boolean = true;

  constructor(
    private groupService: GroupService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.usersService.getUserDetailsByEmail(this.authService.getCurrentUser() || '').subscribe((response) => {
        this.currentUser = response;
        this.fetchGroupDetails();
      });
    });
  }
  
  private fetchGroupDetails() {
    this.groupService.getGroupDetailsWithMembers(this.groupId).subscribe({
      next: (groupDetails) => {
        this.groupDetails = groupDetails;
        this.members$ = this.groupDetails.members;
        this.balanceWithNames = this.groupDetails.balancesWithNames;
        this.members$.map((member: any) => {
          if (member.email == this.currentUser.email) {
            this.currentUser.balance = member.balance;
          }
        })
        this.loading = false; 
      },
      error: (error) => {
        console.error('Error fetching group details', error);
      },
    });
  }

  confirmSettleBalance(index: number): void {
    const confirmed = window.confirm('Are you sure you want to settle this balance?');
    if (confirmed) {
      window.open("https://rzp.io/l/EjwJZUEOu", '_blank');
      this.loading = true; // This line may or may not be needed depending on your requirements.
      this.settleSelectedBalance(index);
    }
  }
  

  settleSelectedBalance(index: any) {
    const transactionId = this.groupDetails.balance[index]._id;
    this.groupService.settleBalance(this.groupId, transactionId).subscribe({
      next: (response) => {
        console.log(response.message)
        this.fetchGroupDetails()
      },
      error: (error) => {
        console.error('Error settling balance:', error);
      }
    });
  }
}
