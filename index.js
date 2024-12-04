const express = require("express");
const cors = require("cors");

const app = express();

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Properly formatted and indented C code as a string
const a = `
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <semaphore.h>

#define NUM_THREADS 3

int shared = 0;
sem_t semaphore;
void *thread_func(void *arg) {
    int id = *(int *) arg;
    int local = 0;
    sem_wait(&semaphore);
    for (int i = 0; i < 1000000; i++) {
        local = shared;
        local++;
        shared = local;
    }
    printf("Thread %d: shared = %d\\n", id, shared);
    sem_post(&semaphore);
    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];
    int thread_ids[NUM_THREADS];
    sem_init(&semaphore,0,1);
    for (int i = 0; i < NUM_THREADS; i++) {
        thread_ids[i] = i;
        pthread_create(&threads[i], NULL, thread_func, (void *) &thread_ids[i]);
    }

    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Final value of shared = %d\\n", shared);
    sem_destroy(&semaphore);
    return 0;
}
`;


const b = `
Prevention of race condition using mutex

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

#define NUM_THREADS 3

int shared = 0;
pthread_thread_t mutex;
void *thread_func(void *arg) {
    int id = *(int *) arg;
    int local = 0;
    pthread_mutex_lock(&mutex);
    for (int i = 0; i < 1000000; i++) {
    local = shared;
    local++;
    shared = local;
    }
    printf("Thread %d: shared = %d\n", id, shared);
    pthread_mutex_unlock(&mutex);
    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];
    int thread_ids[NUM_THREADS];
    pthread_mutex_init(&mutex,NULL);
    for (int i = 0; i < NUM_THREADS; i++) {
    thread_ids[i] = i;
    pthread_create(&threads[i], NULL, thread_func, (void *) &thread_ids[i]);
    }

    for (int i = 0; i < NUM_THREADS; i++) {
    pthread_join(threads[i], NULL);
    }

    printf("Final value of shared = %d\n", shared);

    return 0;
}


`;

const c = `
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>


int main() {
int pipefd[2]; // file descriptors for the pipe
char buffer[25];
pid_t pid;

if (pipe(pipefd) == -1) { // create the pipe
    printf("Pipe failed\n");
    return 1;
}

pid = fork(); // create a child process

if (pid < 0) { // fork failed
    printf("Fork failed\n");
    return 1;
}

if (pid > 0) { // parent process
    close(pipefd[0]); // close the read end of the pipe
    printf("Parent process writing to pipe...\n");
    write(pipefd[1], "Hello, child process!", 25);
    close(pipefd[1]); // close the write end of the pipe
}
else { // child process
    close(pipefd[1]); // close the write end of the pipe
    printf("Child process reading from pipe...\n");
    read(pipefd[0], buffer, 25);
    printf("Child process received: %s\n", buffer);
    close(pipefd[0]); // close the read end of the pipe
}

return 0;
}
`;


const d = `
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>



int main()
{
char buf[20];
int pid, fd1, fd2;
// Create the named pipe
if (mkfifo(pipe_name, 0666) == -1) {
    printf("mkfifo failed\n");
    exit(1);
}

// Fork the child process
pid = fork();
if (pid == -1) {
    printf("fork failed\n");
    exit(1);
}

if (pid == 0) { // Child process
    // Open the named pipe for reading
    fd1 = open(pipe_name, O_RDONLY);
    if (fd1 == -1) {
        printf("open failed\n");
        exit(1);
    }

    // Read from the named pipe and print to standard output
    while (read(fd1, buf, 20) > 0) {
        write(1, buf, 20);
    }

    // Close the named pipe and exit
    close(fd1);
    exit(0);
} else { // Parent process
    // Open the named pipe for writing
    fd2 = open(pipe_name, O_WRONLY);
    if (fd2 == -1) {
        printf("open failed\n");
        exit(1);
    }

    // Write some data to the named pipe
    write(fd, "Hello, world!\n", 20);

    // Close the named pipe and exit
    close(fd2);
    exit(1);
}

return 0;
}

`;


const e = `
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

int main() {
    int pipefd[2]; // Array to hold the two ends of the pipe
    pid_t pid;
    char write_msg[] = "Hello from parent!";
    char read_msg[100];

    // Create the pipe
    if (pipe(pipefd) == -1) {
        perror("Pipe creation failed");
        exit(EXIT_FAILURE);
    }

    // Create a child process
    pid = fork();

    if (pid == -1) {
        perror("Fork failed");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process
        close(pipefd[1]); // Close the write end of the pipe
        read(pipefd[0], read_msg, sizeof(read_msg)); // Read data from the pipe
        printf("Child received: %s\n", read_msg);
        close(pipefd[0]); // Close the read end of the pipe
    } else {
        // Parent process
        close(pipefd[0]); // Close the read end of the pipe
        write(pipefd[1], write_msg, strlen(write_msg) + 1); // Write data to the pipe
        close(pipefd[1]); // Close the write end of the pipe
        wait(NULL); // Wait for the child process to finish
    }

    return 0;
}
`;


const f = `
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

#define FIFO_PATH "/tmp/myfifo"

int main() {
    int fd;
    char message[] = "Hello from the writer!";

    // Create a named pipe (FIFO) if it doesn't exist
    if (mkfifo(FIFO_PATH, 0666) == -1) {
        perror("mkfifo");
        // If the pipe already exists, that's fine
    }

    // Open the FIFO for writing
    fd = open(FIFO_PATH, O_WRONLY);
    if (fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // Write the message to the FIFO
    write(fd, message, strlen(message) + 1); // +1 to include the null terminator
    printf("Writer: Sent message: %s\n", message);

    close(fd); // Close the FIFO
    return 0;
}
`;

const g = `

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_THREADS 5
#define ITERATIONS 1000

int counter = 0;           // Shared resource
pthread_mutex_t lock;      // Mutex lock

// Function to increment the counter
void *increment_counter(void *arg) {
    for (int i = 0; i < ITERATIONS; i++) {
        pthread_mutex_lock(&lock);    // Lock the mutex
        counter++;                    // Critical section
        pthread_mutex_unlock(&lock);  // Unlock the mutex
    }
    return NULL;
}

int main() {
    pthread_t threads[NUM_THREADS];
    int i;

    // Initialize the mutex
    if (pthread_mutex_init(&lock, NULL) != 0) {
        perror("Mutex initialization failed");
        exit(EXIT_FAILURE);
    }

    // Create threads
    for (i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&threads[i], NULL, increment_counter, NULL) != 0) {
            perror("Thread creation failed");
            exit(EXIT_FAILURE);
        }
    }

    // Wait for all threads to finish
    for (i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // Destroy the mutex
    pthread_mutex_destroy(&lock);

    // Print the final value of the counter
    printf("Final counter value: %d\n", counter);

    return 0;
}
`;


const h = `

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define BUFFER_SIZE 5  // Size of the shared buffer

int buffer[BUFFER_SIZE];
int in = 0, out = 0;    // Buffer indices
sem_t empty, full;      // Semaphores for empty and full slots
pthread_mutex_t mutex;  // Mutex lock for mutual exclusion

// Producer function
void *producer(void *arg) {
    int item;
    for (int i = 0; i < 10; i++) {
        item = rand() % 100; // Produce a random item
        sem_wait(&empty);    // Wait for an empty slot
        pthread_mutex_lock(&mutex); // Lock the buffer

        // Add the item to the buffer
        buffer[in] = item;
        printf("Producer produced: %d\n", item);
        in = (in + 1) % BUFFER_SIZE;

        pthread_mutex_unlock(&mutex); // Unlock the buffer
        sem_post(&full); // Signal that a slot is filled

        sleep(1); // Simulate production time
    }
    return NULL;
}

// Consumer function
void *consumer(void *arg) {
    int item;
    for (int i = 0; i < 10; i++) {
        sem_wait(&full);    // Wait for a filled slot
        pthread_mutex_lock(&mutex); // Lock the buffer

        // Remove the item from the buffer
        item = buffer[out];
        printf("Consumer consumed: %d\n", item);
        out = (out + 1) % BUFFER_SIZE;

        pthread_mutex_unlock(&mutex); // Unlock the buffer
        sem_post(&empty); // Signal that a slot is empty

        sleep(1); // Simulate consumption time
    }
    return NULL;
}

int main() {
    pthread_t prod_thread, cons_thread;

    // Initialize semaphores and mutex
    sem_init(&empty, 0, BUFFER_SIZE); // Initialize empty slots to BUFFER_SIZE
    sem_init(&full, 0, 0);            // Initialize full slots to 0
    pthread_mutex_init(&mutex, NULL);

    // Create producer and consumer threads
    pthread_create(&prod_thread, NULL, producer, NULL);
    pthread_create(&cons_thread, NULL, consumer, NULL);

    // Wait for threads to finish
    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);

    // Destroy semaphores and mutex
    sem_destroy(&empty);
    sem_destroy(&full);
    pthread_mutex_destroy(&mutex);

    return 0;
}

`;


const i = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/wait.h>
#include <unistd.h>

#define SHM_SIZE 1024 // Size of the shared memory segment

int main() {
    key_t key = ftok("shmfile", 65); // Generate a unique key
    if (key == -1) {
        perror("ftok");
        exit(EXIT_FAILURE);
    }

    // Create a shared memory segment
    int shmid = shmget(key, SHM_SIZE, 0666 | IPC_CREAT);
    if (shmid == -1) {
        perror("shmget");
        exit(EXIT_FAILURE);
    }

    pid_t pid = fork();

    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process: Reads data from the shared memory
        char *shared_mem = (char *)shmat(shmid, NULL, 0); // Attach shared memory
        if (shared_mem == (char *)-1) {
            perror("shmat (child)");
            exit(EXIT_FAILURE);
        }

        printf("Child: Reading data from shared memory...\n");
        printf("Child: Received: %s\n", shared_mem);

        shmdt(shared_mem); // Detach shared memory
    } else {
        // Parent process: Writes data to the shared memory
        char *shared_mem = (char *)shmat(shmid, NULL, 0); // Attach shared memory
        if (shared_mem == (char *)-1) {
            perror("shmat (parent)");
            exit(EXIT_FAILURE);
        }

        char message[] = "Hello from parent!";
        printf("Parent: Writing data to shared memory...\n");
        strncpy(shared_mem, message, SHM_SIZE); // Write data to shared memory

        shmdt(shared_mem); // Detach shared memory

        wait(NULL); // Wait for the child process to finish

        // Remove the shared memory segment
        shmctl(shmid, IPC_RMID, NULL);
    }

    return 0;
}


`;


const all = `

race condition using semaphore optimized

#include<stdio.h>
#include<pthread.h>
#include<semaphore.h>

int sv=0;
sem_t sem;
void *f1(void *arg){

for(int i=0; i<100000; i++){
sem_wait(&sem);
sv++;
sem_post(&sem);
}
}
int main(){
pthread_t t1;
pthread_t t2;
sem_init(&sem,0,1);
pthread_create(&t1,NULL,f1,NULL);
pthread_create(&t2,NULL,f1,NULL);
pthread_join(t1,NULL);
pthread_join(t2,NULL);
sem_destroy(&sem);
printf("Expected value: 200000\n");
printf("Actual value: %d\n",sv);
return 0;






Prevention of race condition using mutex

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

#define NUM_THREADS 3

int shared = 0;
pthread_thread_t mutex;
void *thread_func(void *arg) {
    int id = *(int *) arg;
    int local = 0;
    pthread_mutex_lock(&mutex);
    for (int i = 0; i < 1000000; i++) {
    local = shared;
    local++;
    shared = local;
    }
    printf("Thread %d: shared = %d\n", id, shared);
    pthread_mutex_unlock(&mutex);
    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];
    int thread_ids[NUM_THREADS];
    pthread_mutex_init(&mutex,NULL);
    for (int i = 0; i < NUM_THREADS; i++) {
    thread_ids[i] = i;
    pthread_create(&threads[i], NULL, thread_func, (void *) &thread_ids[i]);
    }

    for (int i = 0; i < NUM_THREADS; i++) {
    pthread_join(threads[i], NULL);
    }

    printf("Final value of shared = %d\n", shared);

    return 0;
}

rc using mutex optimized

#include<stdio.h>
#include<pthread.h>
int sv=0;
pthread_mutex_t m;
void *f1(void *arg){

for(int i=0; i<100000; i++){
pthread_mutex_lock(&m);
sv++;
pthread_mutex_unlock(&m);
}
}
int main(){
pthread_t t1;
pthread_t t2;
pthread_mutex_init(&m,NULL);
pthread_create(&t1,NULL,f1,NULL);
pthread_create(&t2,NULL,f1,NULL);
pthread_join(t1,NULL);
pthread_join(t2,NULL);
pthread_mutex_destroy(&m);
printf("Expected value: 200000\n");
printf("Actual value: %d\n",sv);
return 0;







Program to establish Interprocess communication between Parent and child process using unnamed pipe.


#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>


int main() {
int pipefd[2]; // file descriptors for the pipe
char buffer[25];
pid_t pid;

if (pipe(pipefd) == -1) { // create the pipe
    printf("Pipe failed\n");
    return 1;
}

pid = fork(); // create a child process

if (pid < 0) { // fork failed
    printf("Fork failed\n");
    return 1;
}

if (pid > 0) { // parent process
    close(pipefd[0]); // close the read end of the pipe
    printf("Parent process writing to pipe...\n");
    write(pipefd[1], "Hello, child process!", 25);
    close(pipefd[1]); // close the write end of the pipe
}
else { // child process
    close(pipefd[1]); // close the write end of the pipe
    printf("Child process reading from pipe...\n");
    read(pipefd[0], buffer, 25);
    printf("Child process received: %s\n", buffer);
    close(pipefd[0]); // close the read end of the pipe
}

return 0;
}










Interprocess Communication using mkfifo()

#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>



int main()
{
char buf[20];
int pid, fd1, fd2;
// Create the named pipe
if (mkfifo(pipe_name, 0666) == -1) {
    printf("mkfifo failed\n");
    exit(1);
}

// Fork the child process
pid = fork();
if (pid == -1) {
    printf("fork failed\n");
    exit(1);
}

if (pid == 0) { // Child process
    // Open the named pipe for reading
    fd1 = open(pipe_name, O_RDONLY);
    if (fd1 == -1) {
        printf("open failed\n");
        exit(1);
    }

    // Read from the named pipe and print to standard output
    while (read(fd1, buf, 20) > 0) {
        write(1, buf, 20);
    }

    // Close the named pipe and exit
    close(fd1);
    exit(0);
} else { // Parent process
    // Open the named pipe for writing
    fd2 = open(pipe_name, O_WRONLY);
    if (fd2 == -1) {
        printf("open failed\n");
        exit(1);
    }

    // Write some data to the named pipe
    write(fd, "Hello, world!\n", 20);

    // Close the named pipe and exit
    close(fd2);
    exit(1);
}

return 0;
}





implement ipc using unnamed pipe


#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

int main() {
    int pipefd[2]; // Array to hold the two ends of the pipe
    pid_t pid;
    char write_msg[] = "Hello from parent!";
    char read_msg[100];

    // Create the pipe
    if (pipe(pipefd) == -1) {
        perror("Pipe creation failed");
        exit(EXIT_FAILURE);
    }

    // Create a child process
    pid = fork();

    if (pid == -1) {
        perror("Fork failed");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process
        close(pipefd[1]); // Close the write end of the pipe
        read(pipefd[0], read_msg, sizeof(read_msg)); // Read data from the pipe
        printf("Child received: %s\n", read_msg);
        close(pipefd[0]); // Close the read end of the pipe
    } else {
        // Parent process
        close(pipefd[0]); // Close the read end of the pipe
        write(pipefd[1], write_msg, strlen(write_msg) + 1); // Write data to the pipe
        close(pipefd[1]); // Close the write end of the pipe
        wait(NULL); // Wait for the child process to finish
    }

    return 0;
}









implement ipc using named pipe

Use mkfifo to create a named pipe.
One process writes data to the pipe.
Another process reads data from the pipe.
Code Example:
Writer Program (writer.c):
c
Copy code
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

#define FIFO_PATH "/tmp/myfifo"

int main() {
    int fd;
    char message[] = "Hello from the writer!";

    // Create a named pipe (FIFO) if it doesn't exist
    if (mkfifo(FIFO_PATH, 0666) == -1) {
        perror("mkfifo");
        // If the pipe already exists, that's fine
    }

    // Open the FIFO for writing
    fd = open(FIFO_PATH, O_WRONLY);
    if (fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // Write the message to the FIFO
    write(fd, message, strlen(message) + 1); // +1 to include the null terminator
    printf("Writer: Sent message: %s\n", message);

    close(fd); // Close the FIFO
    return 0;
}
Reader Program (reader.c):
c
Copy code
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>

#define FIFO_PATH "/tmp/myfifo"

int main() {
    int fd;
    char buffer[100];

    // Open the FIFO for reading
    fd = open(FIFO_PATH, O_RDONLY);
    if (fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // Read the message from the FIFO
    read(fd, buffer, sizeof(buffer));
    printf("Reader: Received message: %s\n", buffer);

    close(fd); // Close the FIFO

    // Remove the FIFO after use
    unlink(FIFO_PATH);

    return 0;
}








process sync using mutex lock



#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_THREADS 5
#define ITERATIONS 1000

int counter = 0;           // Shared resource
pthread_mutex_t lock;      // Mutex lock

// Function to increment the counter
void *increment_counter(void *arg) {
    for (int i = 0; i < ITERATIONS; i++) {
        pthread_mutex_lock(&lock);    // Lock the mutex
        counter++;                    // Critical section
        pthread_mutex_unlock(&lock);  // Unlock the mutex
    }
    return NULL;
}

int main() {
    pthread_t threads[NUM_THREADS];
    int i;

    // Initialize the mutex
    if (pthread_mutex_init(&lock, NULL) != 0) {
        perror("Mutex initialization failed");
        exit(EXIT_FAILURE);
    }

    // Create threads
    for (i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&threads[i], NULL, increment_counter, NULL) != 0) {
            perror("Thread creation failed");
            exit(EXIT_FAILURE);
        }
    }

    // Wait for all threads to finish
    for (i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // Destroy the mutex
    pthread_mutex_destroy(&lock);

    // Print the final value of the counter
    printf("Final counter value: %d\n", counter);

    return 0;
}









producer consumer using semaphores




#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define BUFFER_SIZE 5  // Size of the shared buffer

int buffer[BUFFER_SIZE];
int in = 0, out = 0;    // Buffer indices
sem_t empty, full;      // Semaphores for empty and full slots
pthread_mutex_t mutex;  // Mutex lock for mutual exclusion

// Producer function
void *producer(void *arg) {
    int item;
    for (int i = 0; i < 10; i++) {
        item = rand() % 100; // Produce a random item
        sem_wait(&empty);    // Wait for an empty slot
        pthread_mutex_lock(&mutex); // Lock the buffer

        // Add the item to the buffer
        buffer[in] = item;
        printf("Producer produced: %d\n", item);
        in = (in + 1) % BUFFER_SIZE;

        pthread_mutex_unlock(&mutex); // Unlock the buffer
        sem_post(&full); // Signal that a slot is filled

        sleep(1); // Simulate production time
    }
    return NULL;
}

// Consumer function
void *consumer(void *arg) {
    int item;
    for (int i = 0; i < 10; i++) {
        sem_wait(&full);    // Wait for a filled slot
        pthread_mutex_lock(&mutex); // Lock the buffer

        // Remove the item from the buffer
        item = buffer[out];
        printf("Consumer consumed: %d\n", item);
        out = (out + 1) % BUFFER_SIZE;

        pthread_mutex_unlock(&mutex); // Unlock the buffer
        sem_post(&empty); // Signal that a slot is empty

        sleep(1); // Simulate consumption time
    }
    return NULL;
}

int main() {
    pthread_t prod_thread, cons_thread;

    // Initialize semaphores and mutex
    sem_init(&empty, 0, BUFFER_SIZE); // Initialize empty slots to BUFFER_SIZE
    sem_init(&full, 0, 0);            // Initialize full slots to 0
    pthread_mutex_init(&mutex, NULL);

    // Create producer and consumer threads
    pthread_create(&prod_thread, NULL, producer, NULL);
    pthread_create(&cons_thread, NULL, consumer, NULL);

    // Wait for threads to finish
    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);

    // Destroy semaphores and mutex
    sem_destroy(&empty);
    sem_destroy(&full);
    pthread_mutex_destroy(&mutex);

    return 0;
}









ipc using shared memory



#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/wait.h>
#include <unistd.h>

#define SHM_SIZE 1024 // Size of the shared memory segment

int main() {
    key_t key = ftok("shmfile", 65); // Generate a unique key
    if (key == -1) {
        perror("ftok");
        exit(EXIT_FAILURE);
    }

    // Create a shared memory segment
    int shmid = shmget(key, SHM_SIZE, 0666 | IPC_CREAT);
    if (shmid == -1) {
        perror("shmget");
        exit(EXIT_FAILURE);
    }

    pid_t pid = fork();

    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process: Reads data from the shared memory
        char *shared_mem = (char *)shmat(shmid, NULL, 0); // Attach shared memory
        if (shared_mem == (char *)-1) {
            perror("shmat (child)");
            exit(EXIT_FAILURE);
        }

        printf("Child: Reading data from shared memory...\n");
        printf("Child: Received: %s\n", shared_mem);

        shmdt(shared_mem); // Detach shared memory
    } else {
        // Parent process: Writes data to the shared memory
        char *shared_mem = (char *)shmat(shmid, NULL, 0); // Attach shared memory
        if (shared_mem == (char *)-1) {
            perror("shmat (parent)");
            exit(EXIT_FAILURE);
        }

        char message[] = "Hello from parent!";
        printf("Parent: Writing data to shared memory...\n");
        strncpy(shared_mem, message, SHM_SIZE); // Write data to shared memory

        shmdt(shared_mem); // Detach shared memory

        wait(NULL); // Wait for the child process to finish

        // Remove the shared memory segment
        shmctl(shmid, IPC_RMID, NULL);
    }

    return 0;
}

hello




add two no in thread
#include<stdio.h>
#include<pthread.h>
struct data{
int x;
int y;
};

void *add(void *arg){
int num1=((struct data*)arg)->x;
int num2=((struct data*)arg)->y;
printf("%d + %d = %d",num1,num2,num1+num2);
return NULL;
}
int main(){
pthread_t thread;
printf("Enter num1 and num2: ");
int num1,num2;
scanf("%d %d",&num1,&num2);
struct data d1;
d1.x=num1;
d1.y=num2;
pthread_create(&thread,NULL,add,&d1);
pthread_join(thread, NULL);
return 0;
}

display all directory content
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>


int main(int argc, char *argv[])
{
DIR *dp;
struct dirent *direntPt;
dp=opendir(argv[1]);
while((direntPt=readdir(dp))!=NULL){
printf("%s",direntPt->d_name);

}
closedir(dp);




return 0;
}







`;


const responses = {
    "semaphore" : a,
    "mutex" : b,
    "ipcunpipe" : c,
    "ipcnkfifo" : d,
    "ipcunpipe" : e,
    "ipcnapipe" : f,
    "psmutex" : g,
    "pcsema" : h,
    "ipcshared" : i,
    "all" : all
};



// Define your route
const router = express.Router();

const PORT = 9999;

app.get("/answer", (req, res) => {
    // Set the response header to text/plain to preserve formatting
    res.setHeader("Content-Type", "text/plain");
    const index = req.query.index; // Get the 'index' query parameter

    if (index && responses[index]) {
        // Send the response if the index exists in the list
        res.status(200).send(responses[index]);
    } else {
        // Send a default or error response if the index is invalid or missing
        res.status(404).send("Invalid index or no response found for this query.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is live at port ${PORT}`);
});
