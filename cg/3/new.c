#include <stdio.h>
#include <string.h>
int main(){
  FILE *fp;
  char i[10];
  char fname[]="piramid.obj";
  fp = fopen(fname,"r");
  fscanf(fp,"%s",i);
  printf("%s",i);
  char k[]="v";
  printf("%d\n",strcmp(k,"v"));
  printf("%d\n",strcmp(i,"v"));
  if(strcmp(i,"v")==0){
  printf("aaa");
  }  fclose(fp);
}